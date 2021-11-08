import { Controller, Get, Post, Put, Param, Body } from "@nestjs/common";
import { CreateStudentDto, UpdateStudentDto, FindStudentResponseDto, StudentResponseDto } from "./dto/student.dto";

@Controller('students')
export class StudentController {

    @Get()
    getStudents(): FindStudentResponseDto[] {
        return "All students";
    }

    @Get('/:studentId')
    getStudentById(
        // @Param() param: { studentId: string }
        @Param('studentId') studentId: string
    ): FindStudentResponseDto {
        return `Get Student with id of ${studentId}`;
    }

    @Post()
    createStudent(
        @Body() body: CreateStudentDto
    ): StudentResponseDto {
        return `Create Student with the following data ${JSON.stringify(body)}`;
    }

    @Put('/:studentId')
    updateStudent(
        @Param('studentId') studentId: string,
        @Body() body: UpdateStudentDto
    ): StudentResponseDto {
        return `Update Student with id of ${studentId} with data of ${JSON.stringify(body)}`;
    }

}