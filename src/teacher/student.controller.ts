import { Controller, Get, Param, Put } from '@nestjs/common';
import { FindStudentResponseDto, StudentResponseDto } from 'src/student/dto/student.dto';


@Controller('teachers/:teacherId/students')
export class StudentTeacherController {

    @Get()
    getStudents(
        @Param('teacherId') teacherId: string
    ): FindStudentResponseDto[] {
        return `Get All Students That Belong To A Teacher id of ${teacherId}`;
    }

    @Put('/:studentId')
    updateStudentTeacher(
        @Param('teacherId') teacherId: string,
        @Param('studentId') studentId: string
    ): StudentResponseDto {
        return `Update Student id of ${studentId} of Teacher id of ${teacherId}`;
    }

}
