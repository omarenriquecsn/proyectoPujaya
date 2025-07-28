import { registerAs } from '@nestjs/config';

interface FirebaseConfig {
  serviceAccountJson: string;
}

export default registerAs('firebase', (): FirebaseConfig => {
  console.log(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON enviroment variable is not set',
    );
  }
  return {
    serviceAccountJson: serviceAccountJson,
  };
});
