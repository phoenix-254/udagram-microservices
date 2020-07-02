import { Router, Request, Response } from 'express';

import { User } from './models/User';

import { NextFunction } from 'connect';

import { config } from './config';

import * as JWT from 'jsonwebtoken';
import * as Bcrypt from 'bcrypt';
import * as EmailValidator from 'email-validator';

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

function generateJWT(user: User): string {
    return JWT.sign(user.short(), config.jwt.secret);
}

async function isValidPassword(plainTextPassword: string, hash: string): Promise<boolean> {
    return await Bcrypt.compare(plainTextPassword, hash);
}

async function generatePassword(plainTextPassword: string): Promise<string> {
    const rounds = 10;
    const salt = await Bcrypt.genSalt(rounds);
    const hash = await Bcrypt.hash(plainTextPassword, salt);
    return hash;
}

// GET : api/v0/users/{id}
router.get('/:id', async(req: Request, res: Response) => {
    let { id } = req.params;
    const item = await User.findByPk(id);
    res.status(200).send(item);
});

// GET : api/v0/users/auth/verification
router.get('/auth/verification', 
    authenticate,
    async(req: Request, res: Response) => {
        res.status(200).send({
            auth: true,
            message: 'Authenticated.'
        });
    }
);

// POST : api/v0/users/auth/login
router.post('/auth/login', async(req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    
    // Check if email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ 
            auth: false, 
            message: 'Email is required or malformed' 
        });
    }
  
    // Check if password is provided
    if (!password) {
        return res.status(400).send({ 
            auth: false, 
            message: 'Password is required' 
        });
    }

    // Check if user is registered in database
    const user = await User.findByPk(email);
    if (!user) {
        return res.status(401).send({ 
            auth: false, 
            message: 'Unauthorized' 
        });
    }
  
    // Check if the password is correct
    const isValidPwd = await isValidPassword(password, user.password_hash);
    if (!isValidPwd) {
        return res.status(401).send({
            auth: false,
            message: 'Invalid Password!'
        });
    }
  
    // Generate JWT
    const jwt = generateJWT(user);
  
    res.status(200).send({ 
        auth: true, 
        token: jwt, 
        user: user.short()
    });
});

// POST : api/v0/users/auth/
router.post('/auth', async(req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    // Check if email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ 
            auth: false, 
            message: 'Email is required or malformed' 
        });
    }
  
    // Check if password is provided
    if (!password) {
        return res.status(400).send({ 
            auth: false, 
            message: 'Password is required' 
        });
    }

    // Check if user is already registered in database
    const user = await User.findByPk(email);
    if (user) {
        return res.status(422).send({ 
            auth: false, 
            message: 'User may already exist' 
        });
    }

    const password_hash = await generatePassword(password);  
    const newUser = new User({
        email: email,
        password_hash: password_hash
    });
  
    const savedUser = await newUser.save();
  
    // Generate JWT
    const jwt = generateJWT(savedUser);
  
    res.status(201).send({
        token: jwt, 
        user: savedUser.short()
    });
});

router.get('/auth/', async(req: Request, res: Response) => {
    res.status(200).send('Hello From User Microservice!');
});

router.get('/', async(req: Request, res: Response) => {
    res.status(200).send('Hello From User Microservice!');
});

export const IndexRouter: Router = router;