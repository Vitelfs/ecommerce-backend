import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm";
import { Audit } from "./entities/audit.entity";
import { AuditAction, AuditType } from "./enum/audit.enum";
import { ClsService } from "nestjs-cls";

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
    private readonly allowedAuditTypes = new Set<AuditType>(Object.values(AuditType));

    constructor(private dataSource: DataSource, private cls: ClsService,) {
        dataSource.subscribers.push(this);
    }

    private resolveAuditType(entityClass: any, entityName: string): AuditType | null {
        const className = entityClass?.name ?? entityName;
        const raw = entityClass?.auditType ?? entityName;

        const normalize = (value: unknown): string => {
            if (typeof value !== "string") return "";
            return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
        };

        const normalizedAudit = normalize(className);
        if (!normalizedAudit || normalizedAudit === "AUDIT") return null;

        const normalizedRaw = normalize(raw);
        if (normalizedRaw && this.allowedAuditTypes.has(normalizedRaw as AuditType)) {
            return normalizedRaw as AuditType;
        }

        if (this.allowedAuditTypes.has(normalizedAudit as AuditType)) {
            return normalizedAudit as AuditType;
        }

        return null;
    }

    listenTo() {
        return Object;
    }

    async afterUpdate(event: UpdateEvent<any>) {
        if (!event.entity || !event.databaseEntity) return;

        const auditRepo = event.manager.getRepository(Audit);

        const entityName = event.metadata.name;
        const entityClass = event.metadata.target as any;

        const type = this.resolveAuditType(entityClass, entityName);
        if (!type) return;

        await auditRepo.save({
            title: `${entityName} updated`,
            type,
            action: AuditAction.UPDATE,
            entity_name: entityName,
            entity_id: event.entity.id,
            old_value: event.databaseEntity,
            new_value: event.entity,
            user_id: this.cls.get('userId')
        });
    }

    async afterInsert(event: InsertEvent<any>) {
        if (!event.entity) return;

        const auditRepo = event.manager.getRepository(Audit);

        const entityName = event.metadata.name;
        const entityClass = event.metadata.target as any;

        const type = this.resolveAuditType(entityClass, entityName);
        if (!type) return;

        await auditRepo.save({
            title: `${entityName} created`,
            type,
            action: AuditAction.CREATE,
            entity_name: entityName,
            entity_id: event.entity.id,
            old_value: undefined,
            new_value: event.entity,
            user_id: this.cls.get('userId')
        });
    }

    async afterRemove(event: RemoveEvent<any>) {
        if (!event.databaseEntity) return;

        const auditRepo = event.manager.getRepository(Audit);

        const entityName = event.metadata.name;
        const entityClass = event.metadata.target as any;

        const type = this.resolveAuditType(entityClass, entityName);
        if (!type) return;

        await auditRepo.save({
            title: `${entityName} deleted`,
            type,
            action: AuditAction.DELETE,
            entity_name: entityName,
            entity_id: event.databaseEntity.id,
            old_value: event.databaseEntity,
            new_value: undefined,
            user_id: this.cls.get('userId')
        });
    }
}