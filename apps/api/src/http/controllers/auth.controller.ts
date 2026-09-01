import {UnauthorizedException} from '../../exceptions/index.js';
import {
  PasswordService,
  SessionService,
  UserService,
} from '../../services/index.js';
import {catchAsync} from '../../utils/index.js';
import {HttpStatus} from '../../enums/index.js';

const DUMMY_BCRYPT_DIGEST =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEe.V8yM5FJ3XQfYxQj3h9W7ZJYx6Q8kJqG';

export const loginHandler = catchAsync(async (req, res) => {
  const {email, password} = req.body;
  const user = await UserService.getUserByEmail(email);
  const digest = user?.passwordDigest ?? DUMMY_BCRYPT_DIGEST;
  const valid = await PasswordService.comparePassword(password, digest);
  if (!user || !valid) throw new UnauthorizedException();
  const sessionWithToken = await SessionService.createSession(user.id);
  const {passwordDigest: _, ...safeUser} = user;
  return res
    .cookie(
      SessionService.getSessionCookieName(),
      sessionWithToken.sessionToken,
      SessionService.getSetSessionCookieOptions(),
    )
    .status(HttpStatus.OK)
    .json({data: safeUser});
});
