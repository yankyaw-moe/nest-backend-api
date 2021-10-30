import { Module } from '@nestjs/common';
import { StudentController } from "../student/student.controller";
import { TeacherController } from 'src/teacher/teacher.controller';
import { StudentTeacherController } from 'src/teacher/student.controller';

@Module({
  imports: [],
  controllers: [StudentController, TeacherController, StudentTeacherController]
})
export class AppModule { }
