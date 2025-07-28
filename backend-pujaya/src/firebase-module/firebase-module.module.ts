import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        const firebaseCfg = configService.get('firebase');

        let serviceAccount: admin.ServiceAccount;
        try {
          serviceAccount = JSON.parse(firebaseCfg.serviceAccountJson);
        } catch (e) {
          // console.error('Error parsin Firebase service accoutn JSON strin', e);
          throw new Error(
            'Invalid Firebase service account JSON configuration',
          );
        }
        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } else {
          // console.log('Firebase admin SDK Initialized');
        }
        return admin.app();
      },
      inject: [ConfigService],
    },
    {
      provide: 'FIREBASE_AUTH',
      useFactory: (firebaseAdmin: admin.app.App) => {
        return firebaseAdmin.auth();
      },
      inject: ['FIREBASE_ADMIN'],
    },
  ],
  exports: ['FIREBASE_AUTH', 'FIREBASE_ADMIN'],
})
export class FirebaseModule {}
