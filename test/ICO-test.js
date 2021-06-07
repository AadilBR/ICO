const { expect } = require('chai');

describe('ICO', function () {
  let dev, owner, Token, token, ICO, ico, Alice, Bob, tx;
  const INIT_SUPPLY = ethers.utils.parseEther('1000000');
  const gwei = 10 ** 9;

  beforeEach(async function () {
    [dev, owner, Token, token, ICO, ico, Alice, Bob] = await ethers.getSigners();
    // ERC20 deployment
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(owner.address, 1000000);
    await token.deployed();
    // ICO deployment
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(dev).deploy(token.address);
    await ico.deployed();
    await token.connect(owner).approve(ico.address, INIT_SUPPLY);
  });

  describe('Deployment', function () {
    it('should display the address of the token contract', async function () {
      expect(await ico.tokenContract()).to.equal(token.address);
    });
    it('Should set balance of ico to 0', async function () {
      expect(await ico.ICOBalance()).to.equal(0);
    });
  });

  describe('Withdraw function', function () {
    it('Should revert if not owner', async function () {
      await expect(ico.connect(Bob).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Buy function', function () {
    it('receive', async function () {
      tx = await Alice.sendTransaction({ to: ico.address, value: 2 * gwei });
      expect(await token.balanceOf(Alice.address)).to.equal(ethers.utils.parseEther('2'));
      expect(await ico.ICOBalance()).to.equal(2 * gwei);
      expect(tx).to.changeEtherBalance(Alice, -2 * gwei);
    });
    it('buyToken', async function () {
      tx = await ico.connect(Alice).buyTokens({ value: gwei });
      expect(await token.balanceOf(Alice.address)).to.equal(ethers.utils.parseEther('1'));
      expect(await ico.ICOBalance()).to.equal(gwei);
      expect(tx).to.changeEtherBalance(Alice, -gwei);
    });
    it('Should emit a Bought event', async function () {
      expect(await ico.connect(Alice).buyTokens({ value: gwei }))
        .to.emit(ico, 'Bought')
        .withArgs(Alice.address, gwei);
    });
  });

  describe('Getter', function () {});
});
