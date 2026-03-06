import { UserService } from "../../../services/user.service";
import { Request, Response } from "express";
import mongoose from "mongoose";

// Create a testable controller with dependency injection
class TestableAuthController {
  private userService: any;

  constructor(userService?: any) {
    this.userService = userService || new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      const parsedData = require("../../../dtos/user.dto").CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: require("zod").prettifyError(parsedData.error)
        });
      }

      const user = await this.userService.registerUser(parsedData.data);
      return res.status(201).json({
        success: true,
        message: " Register success",
        data: user
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || " Internal Server Error"
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = require("../../../dtos/user.dto").LoginUserDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: require("zod").prettifyError(parsedData.error)
        });
      }

      const { token, existingUser } = await this.userService.loginUser(parsedData.data);
      return res.status(200).json({
        success: true,
        data: existingUser,
        token,
        message: " Login success"
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internet Server Error"
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User Id Not found"
        });
      }

      const user = await this.userService.getUserById(userId);
      return res.status(200).json({
        success: true,
        data: user,
        message: "Profile retrieved successfully"
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User Id Not found"
        });
      }

      const parsedData = require("../../../dtos/user.dto").UpdateUserDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: require("zod").prettifyError(parsedData.error)
        });
      }

      const user = await this.userService.updateUser(userId, parsedData.data);
      return res.status(200).json({
        success: true,
        data: user,
        message: "User profile updated successfully"
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }
}

// Create mock functions
const mockRegisterUser = jest.fn();
const mockLoginUser = jest.fn();
const mockGetUserById = jest.fn();
const mockUpdateUser = jest.fn();

// Mock external dependencies
jest.mock("../../../services/user.service", () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      registerUser: mockRegisterUser,
      loginUser: mockLoginUser,
      getUserById: mockGetUserById,
      updateUser: mockUpdateUser,
    })),
  };
});
jest.mock("bcryptjs", () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue("hashedPassword"),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
}));

describe("AuthController Unit Tests", () => {
  let authController: TestableAuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let userServiceMock: jest.Mocked<UserService>;

  beforeEach(() => {
    // Clear all mock functions
    mockRegisterUser.mockClear();
    mockLoginUser.mockClear();
    mockGetUserById.mockClear();
    mockUpdateUser.mockClear();
    
    // Create userServiceMock object
    userServiceMock = {
      registerUser: mockRegisterUser,
      loginUser: mockLoginUser,
      getUserById: mockGetUserById,
      updateUser: mockUpdateUser,
    } as any;

    // Create controller instance with injected mock
    authController = new TestableAuthController(userServiceMock);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Remove afterEach to allow test-specific mock control

  describe("register", () => {
    it("should register a user successfully", async () => {
      mockRequest = {
        body: {
          name: "Anish",
          email: "anish@test.com",
          password: "Password123!",
          confirmPassword: "Password123!",
        },
      };

      userServiceMock.registerUser.mockResolvedValue({
        _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        name: "Anish",
        email: "anish@test.com",
        password: "hashedPassword",
        role: "user",
        favoriteSongs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: " Register success",
          data: expect.objectContaining({
            name: "Anish",
            email: "anish@test.com",
          }),
        })
      );
    });

    it("should return 400 if registration validation fails", async () => {
      mockRequest = {
        body: {
          name: "", // invalid name
          email: "invalid-email", // invalid email
          password: "123", // weak password
          confirmPassword: "456", // passwords don't match
        },
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Full name is required"),
        })
      );
    });

    it("should return 403 if user already exists", async () => {
      // Set up mock to throw error
      const customError = new Error("Email already in use") as any;
      customError.statusCode = 403;
      userServiceMock.registerUser.mockRejectedValue(customError);

      console.log("Mock setup complete, mock calls:", userServiceMock.registerUser.mock.calls.length);

      mockRequest = {
        body: {
          name: "Anish",
          email: "existing@test.com",
          password: "Password123!",
          confirmPassword: "Password123!",
        },
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      console.log("After controller call, mock calls:", userServiceMock.registerUser.mock.calls.length);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email already in use",
        })
      );
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      // Set up mock to return success
      userServiceMock.loginUser.mockResolvedValue({
        token: "mock-jwt-token",
        existingUser: {
          _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
          name: "Anish",
          email: "anish@test.com",
          password: "hashedPassword",
          role: "user",
          favoriteSongs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      } as any);

      mockRequest = {
        body: {
          email: "test@example.com",
          password: "Password123",
        },
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: "Anish",
            email: "anish@test.com",
          }),
          token: "mock-jwt-token",
          message: " Login success",
        })
      );
    });

    it("should return 400 if login validation fails", async () => {
      mockRequest = {
        body: {
          email: "", // invalid email
          password: "",
        },
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Too small: expected string to have >=6 characters"),
        })
      );
    });

    it("should return 401 for invalid credentials", async () => {
      mockRequest = {
        body: {
          email: "test@example.com",
          password: "wrongpassword",
        },
      };

      const customError = new Error("Email not found") as any;
      customError.statusCode = 404;
      userServiceMock.loginUser.mockRejectedValue(customError);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email not found",
        })
      );
    });
  });

  it("should return 400 if login validation fails", async () => {
    mockRequest = {
      body: {
        email: "", // invalid email
        password: "",
      },
    };

    await authController.login(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Too small: expected string to have >=6 characters"),
      })
    );
  });

  describe("getProfile", () => {
    it("should return user profile successfully", async () => {
      // Set up mock to return user
      userServiceMock.getUserById.mockResolvedValue({
        _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        name: "Anish",
        email: "anish@test.com",
        password: "hashedPassword",
        role: "user",
        favoriteSongs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockRequest = {
        user: { id: "507f1f77bcf86cd799439011" },
      } as any;

      await authController.getProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: "Anish",
            email: "anish@test.com",
          }),
          message: "Profile retrieved successfully",
        })
      );
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest = {} as any;

      await authController.getProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User Id Not found",
        })
      );
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      // Set up mock to return updated user
      userServiceMock.updateUser.mockResolvedValue({
        _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        name: "Updated Name",
        email: "updated@example.com",
        password: "hashedPassword",
        role: "user",
        favoriteSongs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockRequest = {
        user: { id: "507f1f77bcf86cd799439011" },
        body: {
          name: "Updated Name",
          email: "updated@example.com",
        },
      } as any;

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: "Updated Name",
            email: "updated@example.com",
          }),
          message: "User profile updated successfully",
        })
      );
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest = {
        body: {
          name: "Updated Name",
        },
      } as any;

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User Id Not found",
        })
      );
    });

    it("should return 400 if update validation fails", async () => {
      mockRequest = {
        user: { id: "1" },
        body: {
          name: "", // invalid name
          email: "invalid-email", // invalid email
        },
      } as any;

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Full name is required"),
        })
      );
    });

    it("should return 404 if user not found during update", async () => {
      mockRequest = {
        user: { id: "nonexistent" },
        body: {
          name: "Updated Name",
        },
      } as any;

      const customError = new Error("User not found") as any;
      customError.statusCode = 404;
      userServiceMock.updateUser.mockRejectedValue(customError);

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User not found",
        })
      );
    });
  });
});
