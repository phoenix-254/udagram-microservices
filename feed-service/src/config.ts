export const config = {
    "username": process.env.UdagramPostgresqlUsername,
    "password": process.env.UdagramPostgresqlPassword,
    "database": process.env.UdagramPostgresqlDatabase,
    "host": process.env.UdagramPostgresqlHost,
    "dialect": 'postgres',
    "aws_region": process.env.UdagramAWSRegion,
    "aws_profile": process.env.UdagramAWSProfile,
    "aws_media_bucket": process.env.UdagramAWSMediaBucket,
    "url": process.env.UdagramWebAppUrl,
    "jwt": {
        "secret": process.env.UdagramJwtSecret
    }
  }
  