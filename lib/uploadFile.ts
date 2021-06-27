/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AWS from 'aws-sdk';
import shortid from 'shortid';
import moment from 'moment';

declare const Buffer: any;

const bucket_name = String(process.env.AWS_S3_BUCKET_NAME);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ID,
  secretAccessKey: process.env.AWS_S3_SECRET,
});

export default async function uploadFile(file: any, type: string): Promise<string|undefined> {
  // Setting up S3 upload parameters
  const base64Data = new Buffer.from(
    file.replace(/^data:image\/\w+;base64,/, ''),
    'base64',
  );
  const key = shortid.generate() + moment().valueOf();

  const params = {
    Bucket: bucket_name,
    Key: `${key}.jpeg`, // File name you want to save as in S3
    Body: base64Data,
    ContentEncoding: 'base64', // required
    ContentType: type,
    ACL: 'public-read',
  };
  let location = '';
  try {
    const { Location } = await s3.upload(params).promise();
    location = Location;
    return location;
  } catch (error) {
    console.log(error);
  }
}
