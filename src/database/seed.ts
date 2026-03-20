import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enum/user.enum';
import { EntityStatus } from 'src/common/enum/entity-status.enum';

config();

async function seed() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Não sincronizar no seed
    });

    try {
        await dataSource.initialize();
        console.log('✅ Conectado ao banco de dados');

        const userRepository = dataSource.getRepository(User);

        // Verifica se o usuário já existe
        const existingUser = await userRepository.findOne({
            where: { email: 'admin@advogai.com' },
        });

        if (existingUser) {
            console.log('⚠️  Usuário admin já existe no banco de dados');
            await dataSource.destroy();
            return;
        }

        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        // Cria o usuário admin
        const adminUser = userRepository.create({
            first_name: 'Administrador',
            second_name: 'Geral',
            email: 'admin@advogai.com',
            cpf: '12345678910',
            password: hashedPassword,
            role: UserRole.ADMIN,
            status: EntityStatus.ACTIVE,
            avatar: null,
        });

        await userRepository.save(adminUser);
        console.log('✅ Usuário admin criado com sucesso!');
        console.log('📧 Email: admin@advogai.com');
        console.log('🔑 Senha: admin123');

        await dataSource.destroy();
        console.log('✅ Seed concluído');
    } catch (error) {
        console.error('❌ Erro ao executar seed:', error);
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
        process.exit(1);
    }
}

// Executa o seed
seed();
