import { Router, Request, Response } from 'express';

import { FeedItem } from './models/FeedItem';

import { NextFunction } from 'connect';

import { config } from './config';

import * as JWT from 'jsonwebtoken';

import * as AwsUtils from './aws_utils';

const router: Router = Router();

// Authenticate request
function authenticate(req: Request, res: Response, next: NextFunction) {
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).send({message: 'No authorization headers.'});
    }

    const tokenBearer = req.headers.authorization.split(' ');
    if (tokenBearer.length !== 2) {
        return res.status(401).send({message: 'Malformed token.'});
    }

    const token = tokenBearer[1];
    return JWT.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
            return res.status(500).send({auth: false, message: 'Failed to authenticate.'});
        }

        return next();
    });
}

// Get all feed items
router.get('/', async(req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({
        order: [['id', 'DESC']]
    });

    items.rows.map((item) => {
        if (item.url) {
            item.url = AwsUtils.getGetSignedUrl(item.url);
        }
    });

    res.status(200).send(items);
});

// Get a specific feed item by id
router.get('/:id', async(req: Request, res: Response) => {
    const { id } = req.params;
    const item = await FeedItem.findByPk(id);
    res.status(200).send(item);
});

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    authenticate,
    async(req: Request, res: Response) => {
        const { fileName } = req.params;
        const url = AwsUtils.getPutSignedUrl(fileName);
        
        res.status(201).send({
            url: url
        });
    }
);

// Create a new feed with metadata
router.post('/',
    authenticate,
    async(req: Request, res: Response) => {
        const caption = req.body.caption;
        const fileName = req.body.url;

        if (!caption) {
            return res.status(400).send({message: 'Caption is required or malformed.'});
        }

        if (!fileName) {
            return res.status(400).send({message: 'File url is required.'});
        }

        const item = new FeedItem({
            caption: caption,
            url: fileName,
        });

        const savedItem = await item.save();
        savedItem.url = AwsUtils.getGetSignedUrl(savedItem.url);
        res.status(201).send(savedItem);
    }
);

export const IndexRouter: Router = router;
