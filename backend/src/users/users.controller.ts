import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Patch('profile')
  updateProfile(@Req() req, @Body() body: any) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @UseGuards(JwtGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const userId = (req as any).user?.sub ?? 'unknown';
        const unique = `${userId}_${Date.now()}${extname(file.originalname)}`;
        cb(null, unique);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)) {
        return cb(new Error('Apenas imagens são permitidas'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadAvatar(@Req() req, @UploadedFile() file: any) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.usersService.updateAvatar(req.user.sub, avatarUrl);
    return { avatarUrl };
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
