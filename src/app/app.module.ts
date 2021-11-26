import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { StudentModule } from 'src/student/student.module';
import { TeacherModule } from 'src/teacher/teacher.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [TeacherModule, StudentModule, AuthModule]
})
export class AppModule { }
