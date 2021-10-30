import { Controller, Get, Post, Put, Param, Body } from "@nestjs/common";


@Controller('students')
export class StudentController {

    @Get()
    getStudents() {
        return "All students";
    }

    @Get('/:studentId')
    getStudentById(
        // @Param() param: { studentId: string }
        @Param('studentId') studentId: string
    ) {
        return `Get Student with id of ${studentId}`;
    }

    @Post()
    createStudent(
        // @Body('name') name
        @Body() body
    ) {
        return `Create Student with the following data ${JSON.stringify(body)}`;
    }

    @Put('/:studentId')
    updateStudent(
        @Param('studentId') studentId: string,
        @Body() body
    ) {
        return `Update Student with id of ${studentId} with data of ${JSON.stringify(body)}`;
    }

}