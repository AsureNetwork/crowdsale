const Greeter = artifacts.require('Greeter');

contract('Greeter', async accounts => {
    describe('greetCounter', () => {
        it('should have initial value of 0', async () => {
            const greeter = await Greeter.deployed();

            const greetCounter = await greeter.greetCounter.call();

            expect(greetCounter.toNumber()).to.eq(0);
        });
    });

    describe('greet', () => {
        it('should greet and increment the greetCounter', async () => {
            const greeter = await Greeter.deployed();

            await greeter.greet();
            const message = await greeter.greet.call();

            const greetCounter = await greeter.greetCounter.call();

            expect(message).to.eq('Hello, ETH.RUHR');
            expect(greetCounter.toNumber()).to.eq(1);
        });
    });
});