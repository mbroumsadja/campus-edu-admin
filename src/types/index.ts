// src/types/index.ts
// Types TypeScript centralisés — miroir des modèles du backend

export type Role    = 'etudiant' | 'enseignant' | 'admin'
export type Statut  = 'actif' | 'en_attente' | 'suspendu'
export type Niveau  = 'L1' | 'L2' | 'L3' | 'M1' | 'M2'
export type Semestre = 'S1'|'S2'|'S3'|'S4'|'S5'|'S6'|'S7'|'S8'|'S9'|'S10'

// ── Entités ────────────────────────────────────────────────────────

export interface Filiere {
  id:          number
  code:        string
  nom:         string
  departement: string
  actif:       boolean
  ues?:        UE[]
}

export interface UE {
  id:         number
  code:       string
  intitule:   string
  niveau:     Niveau
  semestre:   Semestre
  credits:    number
  filiere_id: number
  filiere?:   Filiere
}

export interface Utilisateur {
  id:                number
  matricule:         string
  nom:               string
  prenom:            string
  email:             string | null
  role:              Role
  statut:            Statut
  niveau:            Niveau | null
  filiere_id:        number | null
  filiere?:          Filiere
  derniereConnexion: string | null
  createdAt:         string
}

export interface Cours {
  id:                 number
  titre:              string
  description:        string | null
  type:               'pdf' | 'video' | 'slide' | 'autre'
  statut:             'en_attente' | 'publie' | 'archive'
  anneAcademique:     string
  vues:               number
  telechargemements:  number
  ue?:                UE
  enseignant?:        Pick<Utilisateur, 'id'|'nom'|'prenom'>
  createdAt:          string
}

export interface Sujet {
  id:                number
  titre:             string
  type:              'partiel'|'rattrapage'|'terminal'|'tp'|'td'
  session:           'normale'|'rattrapage'
  annee:             number
  avecCorrige:       boolean
  statut:            'en_attente'|'publie'|'archive'
  telechargemements: number
  ue?:               UE
  enseignant?:       Pick<Utilisateur, 'id'|'nom'|'prenom'>
  createdAt:         string
}

// ── Auth ───────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken:  string
  refreshToken: string
}

export interface AuthUser {
  id:        number
  matricule: string
  nom:       string
  prenom:    string
  role:      Role
  niveau:    Niveau | null
  filiere:   Filiere | null
}

export interface AuthState {
  user:   AuthUser | null
  tokens: AuthTokens | null
}

// ── API helpers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success:    boolean
  message:    string
  data:       T
}

export interface PaginatedResponse<T> {
  success:    boolean
  data:       T[]
  pagination: {
    total:      number
    page:       number
    limit:      number
    totalPages: number
    hasNext:    boolean
    hasPrev:    boolean
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: { field: string; message: string }[]
}
