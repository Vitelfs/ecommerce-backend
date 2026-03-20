import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AuditAction, AuditType } from "../enum/audit.enum";
import { User } from "src/users/entities/user.entity";

@Entity()
export class Audit {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    title: string;

    @Column({ nullable: true })
    description?: string;

    @Index()
    @Column({
        type: 'enum',
        enum: AuditType,
    })
    type: AuditType;

    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Index()
    @Column({ name: "user_id", nullable: true, type: 'varchar' })
    user_id: string | null;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Index()
    @Column()
    entity_name: string;

    @Column()
    entity_id: string;

    @Column({ type: 'jsonb', nullable: true })
    old_value?: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    new_value?: Record<string, any>;

    @Index()
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
