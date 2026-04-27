// Base class for all domain-specific errors
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype); // Mantener el stack trace en JS/TS
  }
}

export class NetworkError extends DomainError {
  constructor(public override message: string = "Error de conexión con el servidor") {
    super(message);
  }
}

export class AuthenticationError extends DomainError {
  constructor(public override message: string = "No tienes permisos para realizar esta acción o tu sesión expiró") {
    super(message);
  }
}

export class ValidationError extends DomainError {
  constructor(public override message: string) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  constructor(public override message: string) {
    super(message);
  }
}
