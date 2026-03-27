export const PHONE_NUMBER_REGEX = /^0[0-9]{9,10}$/;
export const PHONE_BLOCK_REGEX = /\+?\d{1,4}[\s-]?\(?\d{1,3}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/;
export const EMAIL_BLOCK_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const URL_BLOCK_REGEX = /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(?:\/[^\s]*)?/;
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
