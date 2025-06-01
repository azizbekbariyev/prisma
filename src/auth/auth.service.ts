import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "../users/dto";
import * as bcrypt from "bcrypt";
import { User } from "../../generated/prisma";
import { Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService
  ) {}

  async signup(createUserDto: CreateUserDto, res: Response) {
    const { name, email, password, confirm_password } = createUserDto;
    const condidate = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (condidate) {
      throw new ConflictException("User already exists");
    }

    if (password !== confirm_password) {
      throw new BadRequestException("Parollar mos emas");
    }
    const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);
    const user = await this.prismaService.user.create({
      data: { name, email, hashed_password: hashedPassword },
    });

    const tokens = await this.generateToken(user);

    const hashed_refresh_token = bcrypt.hashSync(tokens.refreshToken, 10);
    await this.updateRefreshToken(user.id, hashed_refresh_token);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });
    return {
      message: "New user sifned up",
      tokens,
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { hashed_refresh_token: refreshToken },
    });
  }

  async generateToken(user: User) {
    const payload = {
      id: user.id,
      is_active: user.is_active,
      email: user.email,
      hashed_password: user.hashed_password,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.STAFF_ACCESS_TOKEN_KEY,
        expiresIn: process.env.STAFF_ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.STAFF_REFRESH_TOKEN_KEY,
        expiresIn: process.env.STAFF_REFRESH_TOKEN_TIME,
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
