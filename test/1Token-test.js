const { expect } = require('chai');

describe('TokenToken', function () {
  let dev, owner, Token, token;
  const NAME = 'Token';
  const SYMBOL = 'TT';
  const INIT_SUPPLY = 1000000;
  beforeEach(async function () {
    [dev, owner] = await ethers.getSigners();
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(owner.address, INIT_SUPPLY);
    await token.deployed();
  });
  describe('Deployment', function () {
    it(`Should have name ${NAME}`, async function () {
      expect(await token.name()).to.equal(NAME);
    });
    it(`Should have symbol ${SYMBOL}`, async function () {
      expect(await token.symbol()).to.equal(SYMBOL);
    });
    it('Should set owner', async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
    it(`Should have total supply ${INIT_SUPPLY.toString()}`, async function () {
      expect(await token.totalSupply()).to.equal(ethers.utils.parseEther(INIT_SUPPLY.toString()));
    });
    it('Should mint total supply to owner', async function () {
      expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther(INIT_SUPPLY.toString()));
    });
  });
});
