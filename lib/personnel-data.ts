"use client"; // This directive ensures the code runs only on the client

// phone-js/lib/personnel-data.ts

import { db, Personnel, Project, Department, Position } from './database';

// Re-exporting the interfaces for convenience in other files
export type { Personnel, Project, Department, Position };

// This is the format the frontend components will use (with names instead of IDs)
export interface PersonnelData extends Omit<Personnel, 'projectId' | 'departmentId' | 'positionId'> {
    project: string;
    department: string;
    position: string;
}

/**
 * Fetches all personnel data and joins it with project, department, and position names.
 */
export const getAllPersonnel = async (): Promise<PersonnelData[]> => {
    return await db.personnel.getAll();
};

/**
 * Adds a new personnel record.
 * It resolves project, department, and position names to their respective IDs.
 */
export const addPersonnel = async (person: Omit<PersonnelData, 'id'>): Promise<{ success: boolean; message: string }> => {
    const existingCode = await db.personnel.findByCode(person.personnelCode);
    if (existingCode) {
        return { success: false, message: "کد پرسنلی تکراری است" };
    }
    const existingVoip = await db.personnel.findByVoip(person.voipNumber);
    if (existingVoip) {
        return { success: false, message: "شماره ویپ تکراری است" };
    }

    const project = await db.projects.getOrCreate(person.project);
    const department = await db.departments.getOrCreate(person.department);
    const position = await db.positions.getOrCreate(person.position);

    const newPerson: Omit<Personnel, 'id'> = {
        personnelCode: person.personnelCode,
        persianName: person.persianName,
        englishName: person.englishName,
        voipNumber: person.voipNumber,
        projectId: project.id,
        departmentId: department.id,
        positionId: position.id,
    };

    await db.personnel.add(newPerson);
    return { success: true, message: "پرسنل جدید با موفقیت اضافه شد" };
};

/**
 * Updates an existing personnel record.
 */
export const updatePersonnel = async (personnelCode: string, updatedData: Partial<PersonnelData>): Promise<{ success: boolean; message: string }> => {
    const dataToUpdate: Partial<Omit<Personnel, 'id' | 'personnelCode'>> = {
        ...updatedData
    };
    
    if (updatedData.project) {
        const project = await db.projects.getOrCreate(updatedData.project);
        dataToUpdate.projectId = project.id;
    }
    if (updatedData.department) {
        const department = await db.departments.getOrCreate(updatedData.department);
        dataToUpdate.departmentId = department.id;
    }
    if (updatedData.position) {
        const position = await db.positions.getOrCreate(updatedData.position);
        dataToUpdate.positionId = position.id;
    }

    const result = await db.personnel.update(personnelCode, dataToUpdate);
    if (result) {
        return { success: true, message: "اطلاعات پرسنل با موفقیت به‌روزرسانی شد" };
    }
    return { success: false, message: "پرسنل مورد نظر یافت نشد" };
};

/**
 * Deletes a personnel record by their code.
 */
export const deletePersonnel = async (personnelCode: string): Promise<{ success: boolean; message: string }> => {
    const success = await db.personnel.delete(personnelCode);
    if (success) {
        return { success: true, message: `پرسنل با موفقیت حذف شد` };
    }
    return { success: false, message: "پرسنل مورد نظر یافت نشد" };
};

// --- Functions to get unique lookup values ---

export const getUniqueProjects = async (): Promise<Project[]> => {
    return await db.projects.getAll();
};

export const getUniqueDepartments = async (): Promise<Department[]> => {
    return await db.departments.getAll();
};

export const getUniquePositions = async (): Promise<Position[]> => {
    return await db.positions.getAll();
};
