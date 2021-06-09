const { expect } = require('chai');

describe('Calculator', () => {
  let dev, owner, Token, token, Calculator, calculator, Alice;

  beforeEach(async () => {
    [dev, owner, Token, token, Calculator, calculator, Alice] = await ethers.getSigners();
    // ERC20 deployment
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(owner.address);
    await token.deployed();
    // Calculator deployment
    Calculator = await ethers.getContractFactory('Calculator');
    calculator = await Calculator.deploy(token.address, owner.address);
    await calculator.deployed();
  });

  describe('Deployment', function () {
    it('Should return the price to use calculator function', async function () {
      expect(await calculator.price()).to.equal(ethers.utils.parseEther('1'));
    });
  });

  describe('Add', function () {
    it('should return the right result', async function () {
      await expect(calculator.add(2, 3)).to.emit(calculator, 'Calculated').withArgs('Add', dev.address, 2, 3, 5);
      await expect(calculator.add(-2, 3)).to.emit(calculator, 'Calculated').withArgs('Add', dev.address, -2, 3, 1);
    });
  });
});
