import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const {confirm_password, password, email , name } = createUserDto;
    if (password !== confirm_password) {
      throw new BadRequestException('Parollar mos emas');
    }
    const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);
    return this.prismaService.user.create({data: {name, email, hashed_password: hashedPassword}});
  }

  findAll() {
    return this.prismaService.user.findMany();  
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({where: {id}}); 
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({where: {id}, data: updateUserDto});
  }

  remove(id: number) {
    return this.prismaService.user.delete({where: {id}});
  }
}
