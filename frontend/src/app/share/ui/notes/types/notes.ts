export type GetNotes = {
  note: string;
  updatedBy: string;
  updatedAt: string;
};
// export type GetNotesResponse = {
//   results: GetNotes[];
//   totals: number;
// };
export enum AdminNoteDataType {
  USERS = 'users',
  LISTINGS = 'listings',
  OFFERS = 'offers',
  HAULAGE_OFFERS = 'haulage_offers',
  SAMPLES = 'samples',
  MFI = 'mfi',
}
export type AdminNote = {
  value: string;
  updatedBy: number;
  updatedAt: string;
};

export type AdminNoteDetail = {
  value: string;
  updatedAt: string;
  updatedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

export type NotesModalData = {
  dataId: number;
  dataType: AdminNoteDataType;
  adminNote: AdminNote | null;
};
