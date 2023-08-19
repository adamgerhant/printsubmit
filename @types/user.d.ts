export type User = {
    uid: string;
    email: string;
};
export type UserContext = {
    currentUser: User
}

export type SubmissionData = {
    data: [];
}
export type SubmissionForm = {
    closed: boolean;
    closedInformation: string;
    closedTitle: string;
    description: string;
    questions: Array<any>;
    title:string;
    uploadInformation:string;
    userID: string;
}
export type Settings = {
    actionWidths: number[];
    headerWidths: number[];
    informationWidths: number[];
    seperateResponses: boolean;
    showDeleted: boolean;
}
export type EmailData = {
    errorEmail: any;
    finishedEmail: any;
    printingEmail: any;
    submittedEmail: any;
    toSend: any;
}
export type CancelRequests = {
    [key: string]: string[]
}
export type IPData = {
    [key: string]: any
}
export type FirebaseContext = {
    submissionData: DocumentData | null;
    submissionFormData: DocumentData | null;
    emailData: DocumentData | null;
    settingsData: DocumentData | null;
    cancelRequests: DocumentData | null;
    IPData: DocumentData | null;
    accountInformation: DocumentData | null;
    emailCount: DocumentData | null;
    setSubmissionData : Dispatch<SetStateAction<DocumentData | null>>;
    setSubmissionFormData : Dispatch<SetStateAction<DocumentData | null>> ;
    setSettingsData : Dispatch<SetStateAction<DocumentData | null>>;
    setEmailData : Dispatch<SetStateAction<DocumentData | null>>;
    setCancelRequests : Dispatch<SetStateAction<DocumentData | null>>;
    setIPData : Dispatch<SetStateAction<DocumentData | null>>;
    resetStatisticsData: Dispatch<SetStateAction<DocumentData | null>>;
    resetData: ()=>void;
    resetAllData: ()=>void;
}