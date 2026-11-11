import type { Proposal } from "@/domain/entities/Proposal";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Las propuestas de los usuarios y su revisión.
export interface ProposalRepository {
  add(proposal: Proposal): Promise<void>;
  findById(id: EntityId): Promise<Proposal | null>;
  // Las propuestas de un usuario, de la más reciente a la más antigua. Solo las suyas: nadie lista las
  // propuestas de otro.
  listByUser(userId: EntityId): Promise<Proposal[]>;
  // La bandeja del administrador: las propuestas pendientes de todos, de la más antigua a la más reciente
  // (la primera que llega es la primera que se revisa).
  listPending(): Promise<Proposal[]>;
  // Guarda la revisión (estado, nota, fecha y revisor) de una propuesta existente.
  save(proposal: Proposal): Promise<void>;
}
