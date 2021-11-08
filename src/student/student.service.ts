import { Injectable } from '@nestjs/common';
import { students } from 'src/db';
import { FindStudentResponseDto, StudentResponseDto, CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StudentService {
    private students = students;
    getStudents(): FindStudentResponseDto[] {
        return this.students;
    }

    getStudentById(id: string): FindStudentResponseDto {
        return this.students.find(student => student.id === id);
    }

    createStudent(payload: CreateStudentDto): StudentResponseDto {
        let newStudent = {
            id: uuidv4(),
            ...payload
        }
        this.students.push(newStudent);
        return newStudent;
    }

    updateStudent(id: string, payload: UpdateStudentDto): StudentResponseDto {
        let updateStudent: StudentResponseDto;

        let updateStudentList = this.students.map(student => {
            if (student.id === id) {
                updateStudent = {
                    id,
                    ...payload
                }
                return updateStudent;
            } else return student;
        });

        this.students = updateStudentList;
        return updateStudent;
    }

    getStudentsByTeacherId(teacherId: string): FindStudentResponseDto[] {
        return this.students.filter(student => student.teacher === teacherId);
    }

    updateStudentTeacher(teacherId: string, studentId: string): StudentResponseDto {
        let updateStudent: StudentResponseDto;

        let updateStudentList = this.students.map(student => {
            if (student.id === studentId) {
                updateStudent = {
                    ...student,
                    teacher: teacherId
                }
                return updateStudent;
            } else return student;
        });

        this.students = updateStudentList;

        return updateStudent;
    }
}


