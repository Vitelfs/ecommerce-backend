import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    token: string;

    @Column({ nullable: false })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'timestamp', nullable: false })
    expiresAt: Date;

    @CreateDateColumn()
    created_at: Date;
}
