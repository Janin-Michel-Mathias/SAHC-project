import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(
    @Body()
    body: CreateAuthDto,
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.first_name,
      body.last_name,
      body.role,
    );
  }
}
