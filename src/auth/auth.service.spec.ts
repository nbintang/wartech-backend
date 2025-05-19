import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { VerificationTokenService } from '../verification-token/verification-token.service';
import { Role } from 'src/users/enums/role.enums';
import { VerificationType } from 'src/verification-token/enums/verification.enum';

// Mock bcrypt and crypto modules
jest.mock('bcrypt');
jest.mock('crypto');
export const createMockUsersService = (): Partial<
  jest.Mocked<UsersService>
> => ({
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUserById: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mailService: jest.Mocked<MailService>;
  let verificationTokenService: jest.Mocked<VerificationTokenService>;

  const mockUser = {
    id: 'user-id-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    verified: true,
    emailVerifiedAt: new Date(),
    acceptedTOS: true,
    image: null,
    role: Role.READER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVerificationToken = {
    id: 'token-id-1',
    userId: 'user-id-1',
    token: 'hashedToken',
    type: VerificationType.EMAIL_VERIFICATION,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: createMockUsersService(),
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmailVerification: jest.fn(),
          },
        },
        {
          provide: VerificationTokenService,
          useValue: {
            getVerificationTokenByUserIdAndType: jest.fn(),
            createVerificationToken: jest.fn(),
            deleteTokensByUserId: jest.fn(),
            deleteTokensByUserAndType: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    mailService = module.get(MailService);
    verificationTokenService = module.get(VerificationTokenService);

    // Setup default mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (crypto.randomBytes as jest.Mock).mockReturnValue({
      toString: jest.fn().mockReturnValue('randomToken'),
    });

    configService.get.mockImplementation((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      return null;
    });

    jwtService.signAsync.mockResolvedValue('jwt-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashData', () => {
    it('should hash data using bcrypt', async () => {
      const data = 'password123';
      const result = await service.hashData(data);

      expect(bcrypt.hash).toHaveBeenCalledWith(data, 10);
      expect(result).toBe('hashedPassword');
    });
  });

  describe('compareHash', () => {
    it('should compare plain text with hash', async () => {
      const plainText = 'password123';
      const hash = 'hashedPassword';

      const result = await service.compareHash(plainText, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainText, hash);
      expect(result).toBe(true);
    });
  });

  describe('generateToken', () => {
    it('should generate a random token', async () => {
      const result = await service.generateToken();

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(result).toBe('randomToken');
    });
  });

  describe('generateJwtTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = 'user-id';
      const email = 'test@example.com';
      const role = 'READER';

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.generateJwtTokens(userId, email, role);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: userId, email, role },
        { secret: 'access-secret', expiresIn: '30s' },
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: userId, email, role },
        { secret: 'refresh-secret', expiresIn: '1d' },
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('signUp', () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      acceptedTOS: true,
      image: null,
      role: Role.READER,
    };

    it('should throw error if user already exists and is verified', async () => {
      const verifiedUser = { ...mockUser, verified: true };
      usersService.getUserByEmail.mockResolvedValue(verifiedUser);

      await expect(service.signUp(createUserDto)).rejects.toThrow(
        new BadRequestException(
          'Your email is already registered and verified. Please sign in.',
        ),
      );
    });

    it('should resend verification email if user exists but not verified', async () => {
      const unverifiedUser = { ...mockUser, verified: false };
      usersService.getUserByEmail.mockResolvedValue(unverifiedUser);

      jest.spyOn(service, 'resendVerificationToken').mockResolvedValue({
        message: 'Please check your email for the verification link',
      });

      const result = await service.signUp(createUserDto);

      expect(service.resendVerificationToken).toHaveBeenCalledWith(
        createUserDto.email,
        VerificationType.EMAIL_VERIFICATION,
      );
      expect(result).toEqual({
        message: 'Please check your email for the verification link',
      });
    });

    it('should throw error if name is not provided', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);
      const invalidDto = { ...createUserDto, name: undefined };
      await expect(service.signUp(invalidDto)).rejects.toThrow(
        new BadRequestException('Name is required'),
      );
    });

    it('should create new user and send verification email', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue(mockUser);
      jest.spyOn(service, 'createAndSendVerificationToken').mockResolvedValue({
        message: 'Please check your email for the verification link',
      });
      await service.signUp(createUserDto);

      expect(usersService.createUser).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        acceptedTOS: createUserDto.acceptedTOS,
        image: null,
        role: Role.READER,
        password: 'hashedPassword',
      });
      expect(service.createAndSendVerificationToken).toHaveBeenCalledWith(
        mockUser,
        VerificationType.EMAIL_VERIFICATION,
      );
    });
  });

  describe('verifyEmail', () => {
    const verifyEmailDto = {
      userId: 'user-id-1',
      token: 'rawToken',
    };

    it('should throw error if user not found', async () => {
      usersService.getUserById.mockResolvedValue(null);

      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should throw error if token is expired', async () => {
      usersService.getUserById.mockResolvedValue(mockUser);
      const expiredToken = {
        ...mockVerificationToken,
        expiresAt: new Date(Date.now() - 1000),
      };
      verificationTokenService.getVerificationTokenByUserIdAndType.mockResolvedValue(
        expiredToken,
      );

      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        new BadRequestException(
          'Token expired, please resend email for verification',
        ),
      );

      expect(
        verificationTokenService.deleteTokensByUserId,
      ).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error if token is invalid', async () => {
      usersService.getUserById.mockResolvedValue(mockUser);
      verificationTokenService.getVerificationTokenByUserIdAndType.mockResolvedValue(
        mockVerificationToken,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        new BadRequestException('Invalid token'),
      );
    });

    it('should verify email successfully', async () => {
      const unverifiedUser = {
        ...mockUser,
        verified: false,
        emailVerifiedAt: null,
      };
      usersService.getUserById.mockResolvedValue(unverifiedUser);
      verificationTokenService.getVerificationTokenByUserIdAndType.mockResolvedValue(
        mockVerificationToken,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.verifyEmail(verifyEmailDto);

      expect(usersService.updateUserById).toHaveBeenCalledWith(
        { id: unverifiedUser.id },
        {
          emailVerifiedAt: expect.any(Date),
          verified: true,
          verificationTokens: { delete: { id: mockVerificationToken.id } },
        },
      );
      expect(result).toHaveProperty('user', unverifiedUser);
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
    });
  });

  describe('signIn', () => {
    const signInDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should throw error if user not found', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('User is not verified'),
      );
    });

    it('should throw error if user not verified', async () => {
      const unverifiedUser = { ...mockUser, verified: false };
      usersService.getUserByEmail.mockResolvedValue(unverifiedUser);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('User is not verified'),
      );
    });

    it('should throw error if password is incorrect', async () => {
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('Password is incorrect'),
      );
    });

    it('should sign in successfully', async () => {
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.signIn(signInDto);

      expect(result).toEqual({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('createAndSendVerificationToken', () => {
    const user = { email: 'john@example.com' };

    it('should throw error if user not found', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.createAndSendVerificationToken(
          user,
          VerificationType.EMAIL_VERIFICATION,
        ),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw error if token creation fails', async () => {
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      verificationTokenService.createVerificationToken.mockResolvedValue(null);

      await expect(
        service.createAndSendVerificationToken(
          user,
          VerificationType.EMAIL_VERIFICATION,
        ),
      ).rejects.toThrow(new BadRequestException('Failed to create token'));
    });

    it('should throw error if email sending fails', async () => {
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      verificationTokenService.createVerificationToken.mockResolvedValue(
        mockVerificationToken,
      );
      mailService.sendEmailVerification.mockResolvedValue(false);

      await expect(
        service.createAndSendVerificationToken(
          user,
          VerificationType.EMAIL_VERIFICATION,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException('Failed to send email'),
      );
    });

    it('should create and send verification token successfully', async () => {
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      verificationTokenService.createVerificationToken.mockResolvedValue(
        mockVerificationToken,
      );
      mailService.sendEmailVerification.mockResolvedValue(true);

      const result = await service.createAndSendVerificationToken(
        user,
        VerificationType.EMAIL_VERIFICATION,
      );

      expect(
        verificationTokenService.createVerificationToken,
      ).toHaveBeenCalledWith({
        user: { connect: { id: mockUser.id } },
        type: VerificationType.EMAIL_VERIFICATION,
        token: 'hashedPassword',
        expiresAt: expect.any(Date),
      });
      expect(mailService.sendEmailVerification).toHaveBeenCalledWith({
        userName: mockUser.name,
        userEmail: mockUser.email,
        userId: mockUser.id,
        token: 'randomToken',
        routes: 'verify',
        subject: 'Confirm your email',
      });
      expect(result).toEqual({
        message: 'Please check your email for the verification link',
      });
    });

    it('should handle password reset type correctly', async () => {
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      verificationTokenService.createVerificationToken.mockResolvedValue(
        mockVerificationToken,
      );
      mailService.sendEmailVerification.mockResolvedValue(true);

      await service.createAndSendVerificationToken(
        user,
        VerificationType.PASSWORD_RESET,
      );

      expect(mailService.sendEmailVerification).toHaveBeenCalledWith({
        userName: mockUser.name,
        userEmail: mockUser.email,
        userId: mockUser.id,
        token: 'randomToken',
        routes: 'verify-reset-password',
        subject: 'Reset your password',
      });
    });
  });

  describe('resendVerificationToken', () => {
    it('should throw error if user not found', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.resendVerificationToken(
          'john@example.com',
          VerificationType.EMAIL_VERIFICATION,
        ),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should delete old token if not expired and create new one', async () => {
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      const validToken = {
        ...mockVerificationToken,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
      verificationTokenService.getVerificationTokenByUserIdAndType.mockResolvedValue(
        validToken,
      );

      jest.spyOn(service, 'createAndSendVerificationToken').mockResolvedValue({
        message: 'Please check your email for the verification link',
      });

      await service.resendVerificationToken(
        'john@example.com',
        VerificationType.EMAIL_VERIFICATION,
      );

      expect(
        verificationTokenService.deleteTokensByUserAndType,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        type: VerificationType.EMAIL_VERIFICATION,
      });
      expect(service.createAndSendVerificationToken).toHaveBeenCalledWith(
        mockUser,
        VerificationType.EMAIL_VERIFICATION,
      );
    });
  });

  describe('verifyResetPasswordToken', () => {
    const verifyDto = {
      userId: 'user-id-1',
      token: 'rawToken',
    };

    it('should throw error if user not found', async () => {
      usersService.getUserById.mockResolvedValue(null);

      await expect(service.verifyResetPasswordToken(verifyDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should throw error if token is expired', async () => {
      usersService.getUserById.mockResolvedValue(mockUser);
      const expiredToken = {
        ...mockVerificationToken,
        type: VerificationType.PASSWORD_RESET,
        expiresAt: new Date(Date.now() - 1000),
      };
      verificationTokenService.getVerificationTokenByUserIdAndType.mockResolvedValue(
        expiredToken,
      );

      await expect(service.verifyResetPasswordToken(verifyDto)).rejects.toThrow(
        new BadRequestException(
          'Token expired, please resend email for verification',
        ),
      );
    });

    it('should verify token successfully', async () => {
      usersService.getUserById.mockResolvedValue(mockUser);
      const passwordResetToken = {
        ...mockVerificationToken,
        type: VerificationType.PASSWORD_RESET,
      };
      verificationTokenService.getVerificationTokenByUserIdAndType.mockResolvedValue(
        passwordResetToken,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyResetPasswordToken(verifyDto);

      expect(result).toBe(true);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      userId: 'user-id-1',
      token: 'rawToken',
      newPassword: 'newPassword123',
    };

    it('should change password successfully', async () => {
      jest.spyOn(service, 'verifyResetPasswordToken').mockResolvedValue(true);
      const countDeleted = 1;
      verificationTokenService.deleteTokensByUserAndType.mockResolvedValue(
        countDeleted,
      );

      const result = await service.changePassword(changePasswordDto);

      expect(service.verifyResetPasswordToken).toHaveBeenCalledWith({
        userId: changePasswordDto.userId,
        token: changePasswordDto.token,
      });
      expect(usersService.updateUserById).toHaveBeenCalledWith(
        { id: changePasswordDto.userId },
        { password: 'hashedPassword' },
      );
      expect(
        verificationTokenService.deleteTokensByUserAndType,
      ).toHaveBeenCalledWith({
        userId: changePasswordDto.userId,
        type: VerificationType.PASSWORD_RESET,
      });
      expect(result).toBe(true);
    });

    it('should throw error if token deletion fails', async () => {
      const countNotDeleted = 0;
      jest.spyOn(service, 'verifyResetPasswordToken').mockResolvedValue(true);
      verificationTokenService.deleteTokensByUserAndType.mockResolvedValue(
        countNotDeleted,
      );

      await expect(service.changePassword(changePasswordDto)).rejects.toThrow(
        new InternalServerErrorException('Something went wrong'),
      );
    });
  });

  describe('refreshToken', () => {
    it('should throw error if user not found', async () => {
      usersService.getUserById.mockResolvedValue(null);

      await expect(service.refreshToken('user-id-1')).rejects.toThrow(
        new ForbiddenException('Access Denied'),
      );
    });

    it('should refresh tokens successfully', async () => {
      usersService.getUserById.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken('user-id-1');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
  });

  describe('signout', () => {
    it('should return success message', async () => {
      const result = await service.signout();

      expect(result).toEqual({
        message: 'Successfully signed out',
      });
    });
  });
});
