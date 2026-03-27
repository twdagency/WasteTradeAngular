export interface AwsS3Config {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

// INFO: interface base on response after using upload s3 API
export interface IAwsS3UploadResponse {
    ETag: string;
    Location: string;
    Key: string;
    Bucket: string;
}
