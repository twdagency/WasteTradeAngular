export interface IUserLoginData {
    id?: number;
    email: string;
    accessToken: string;
    globalRole?: string;
    companyRole?: string;
    isHaulier?: boolean;
}

export interface ILoginResponseData {
    user: IUserLoginData;
}
