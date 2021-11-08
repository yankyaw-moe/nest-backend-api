import { Injectable } from '@nestjs/common';
import { teachers } from 'src/db';
import { FindTeacherResponseDto } from './dto/teacher.dto';

@Injectable()
export class TeacherService {
    private teachers = teachers;

    getTeachers(): FindTeacherResponseDto[] {
        return this.teachers;
    }

    getTeacherById(id: string): FindTeacherResponseDto {
        return this.teachers.find(teacher => teacher.id === id);
    }
}
