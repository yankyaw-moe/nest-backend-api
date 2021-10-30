import { Controller, Get, Post, Put } from "@nestjs/common";


@Controller('students')
export class StudentController {

    @Get()
    getStudents() {
        return "All students";
    }

    @Get('/:studentId')
    getStudentById() {
        return "Student By Id";
    }

    @Post()
    createStudent() {
        return "Create Student";
    }

    @Put('/:studentId')
    updateStudent() {
        return "Update Student";
    }

}