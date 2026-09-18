const { randomBytes } = require('crypto');
const ShopSession = require('../models/ShopSession');
const SessionMember = require('../models/SessionMember');
const SharedCartItem = require('../models/SharedCartItem');
const Variant = require('../models/Variant');

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function findSession(code) {
  return ShopSession.findOne({ code: normalizeCode(code) });
}

async function requireActiveSession(code, res) {
  const session = await findSession(code);
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return null;
  }
  if (!session.active) {
    res.status(410).json({ message: 'Session has ended' });
    return null;
  }
  return session;
}

async function sessionState(session) {
  const [members, cart] = await Promise.all([
    SessionMember.find({ sessionId: session._id }).sort({ joinedAt: 1 }),
    SharedCartItem.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .populate('addedBy', 'displayName userId')
      .populate({
        path: 'variantId',
        populate: {
          path: 'productId',
          populate: { path: 'factionId', select: 'name slug palette' },
        },
      }),
  ]);

  return {
    session: {
      _id: session._id,
      hostUserId: session.hostUserId,
      code: session.code,
      active: session.active,
      createdAt: session.createdAt,
    },
    members,
    cart,
  };
}

async function createCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomBytes(5).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length === 6 && !(await ShopSession.exists({ code }))) return code;
  }
  throw new Error('Could not generate a unique session code');
}

async function createSession(req, res) {
  try {
    const code = await createCode();
    const session = await ShopSession.create({ hostUserId: req.user._id, code, active: true });
    await SessionMember.create({
      sessionId: session._id,
      displayName: req.user.name,
      userId: req.user._id,
      lastSeenAt: new Date(),
    });
    return res.status(201).json(await sessionState(session));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getSession(req, res) {
  try {
    const session = await findSession(req.params.code);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.active) return res.status(410).json({ message: 'Session has ended' });
    return res.json(await sessionState(session));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function joinSession(req, res) {
  try {
    const session = await requireActiveSession(req.params.code, res);
    if (!session) return undefined;
    const displayName = String(req.body.displayName || '').trim();
    if (!displayName) return res.status(400).json({ message: 'displayName is required' });

    const member = await SessionMember.create({
      sessionId: session._id,
      displayName,
      userId: req.user?._id || null,
      lastSeenAt: new Date(),
    });
    return res.status(201).json({ member, ...(await sessionState(session)) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function endSession(req, res) {
  try {
    const session = await findSession(req.params.code);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.hostUserId.equals(req.user._id)) return res.status(403).json({ message: 'Only the host can end this session' });

    session.active = false;
    await session.save();
    return res.json({ session: { _id: session._id, code: session.code, active: session.active } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function findMember(sessionId, memberId) {
  return SessionMember.findOne({ _id: memberId, sessionId });
}

async function pingSession(req, res) {
  try {
    const session = await requireActiveSession(req.params.code, res);
    if (!session) return undefined;
    const member = await findMember(session._id, req.body.memberId);
    if (!member) return res.status(404).json({ message: 'Session member not found' });
    member.lastSeenAt = new Date();
    await member.save();
    return res.json({ member });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function addCartItem(req, res) {
  try {
    const session = await requireActiveSession(req.params.code, res);
    if (!session) return undefined;
    const qty = positiveInteger(req.body.qty);
    if (!qty || !req.body.variantId || !req.body.memberId) {
      return res.status(400).json({ message: 'memberId, variantId, and a positive integer qty are required' });
    }
    const [member, variant] = await Promise.all([
      findMember(session._id, req.body.memberId),
      Variant.findById(req.body.variantId),
    ]);
    if (!member) return res.status(404).json({ message: 'Session member not found' });
    if (!variant) return res.status(400).json({ message: 'Variant not found' });

    await SharedCartItem.findOneAndUpdate(
      { sessionId: session._id, variantId: variant._id },
      { $setOnInsert: { addedBy: member._id }, $inc: { qty } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return res.json(await sessionState(session));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateCartItem(req, res) {
  try {
    const session = await requireActiveSession(req.params.code, res);
    if (!session) return undefined;
    const qty = positiveInteger(req.body.qty);
    if (!qty) return res.status(400).json({ message: 'qty must be a positive integer' });
    const item = await SharedCartItem.findOneAndUpdate(
      { _id: req.params.itemId, sessionId: session._id },
      { qty },
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    return res.json(await sessionState(session));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteCartItem(req, res) {
  try {
    const session = await requireActiveSession(req.params.code, res);
    if (!session) return undefined;
    const item = await SharedCartItem.findOneAndDelete({ _id: req.params.itemId, sessionId: session._id });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    return res.json(await sessionState(session));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createSession,
  getSession,
  joinSession,
  endSession,
  pingSession,
  addCartItem,
  updateCartItem,
  deleteCartItem,
};
