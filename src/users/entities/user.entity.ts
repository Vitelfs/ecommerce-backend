import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enum/user.enum";
import { EntityStatus } from "src/common/enum/entity-status.enum";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    first_name: string;

    @Column({ length: 255 })
    second_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true, length: 11 })
    cpf: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatar: string | null;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: EntityStatus,
        default: EntityStatus.ACTIVE
    })
    status: EntityStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updatead_at: Date;
}