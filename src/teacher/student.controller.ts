import { Controller, Get, Param, Put } from '@nestjs/common';

@Controller('teachers/:teacherId/students')
export class StudentTeacherController {

    @Get()
    getStudents(
        @Param('teacherId') teacherId: string
    ) {
        return `Get All Students That Belong To A Teacher id of ${teacherId}`;
    }

    @Put('/:studentId')
    updateStudentTeacher(
        @Param('teacherId') teacherId: string,
        @Param('studentId') studentId: string
    ) {
        return `Update Student id of ${studentId} of Teacher id of ${teacherId}`;
    }

}
