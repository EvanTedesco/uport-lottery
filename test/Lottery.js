const Lottery = artifacts.require("./Lottery.sol");

contract("Lottery", async accounts => {


    it('picks a winner and distributes the money', async () => {
        const lottery = await Lottery.new();
        await lottery.methods['verifyUser(string,uint256,address)'].sendTransaction("jwt", +(18), accounts[1], { from: accounts[1] })
        await lottery.methods['enter()'].sendTransaction({ from: accounts[1], value: web3.utils.toWei('2', 'ether') });
        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await lottery.methods['pickWinner()'].sendTransaction({ from: accounts[0] });
        const endBalance = await web3.eth.getBalance(accounts[1]);
        const difference = endBalance - initialBalance;
        const finalLotteryBalance = await web3.eth.getBalance(lottery.address);
        assert.equal(difference, web3.utils.toWei('2.00', 'ether'));
        assert.equal(finalLotteryBalance, 0);
        const winner = await lottery.winner();
        assert.equal(winner, accounts[1]);
    });

    it('allows verified users to enter', async () => {
        const lottery = await Lottery.new();
        const initialBalance = await web3.eth.getBalance(accounts[1]);
        try {
            await lottery.methods['enter()'].sendTransaction({ from: accounts[0], value: web3.utils.toWei('2', 'ether') });
        } catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert You must verify your age -- Reason given: You must verify your age.")
        }
        await lottery.methods['verifyUser(string,uint256,address)'].sendTransaction("jwt", +(19), accounts[0], { from: accounts[0] })
        const verification = await lottery.methods['verifications(address)'].call(accounts[0]);
        assert.equal(verification, true);
        try {
            await lottery.methods['enter()'].sendTransaction({ from: accounts[0], value: web3.utils.toWei('2', 'ether') });
        } catch (e) {
            assert.equal(true, false, "something went wrong with age verification")
        }

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        assert.notEqual(initialBalance, finalBalance);
        const players = await lottery.methods['listPlayers()'].call();
        assert.include(players, accounts[0], 'accounts[0] should be in players array');
    })

    it('verifies user if age > 18', async () => {
        const lottery = await Lottery.new();
        try {
            await lottery.methods['verifyUser(string,uint256,address)'].sendTransaction("jwt", +(17), accounts[0], { from: accounts[0] })

        } catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert you must be 18 years old to enter -- Reason given: you must be 18 years old to enter.")
        }
        await lottery.methods['verifyUser(string,uint256,address)'].sendTransaction("jwt", +(18), accounts[0], { from: accounts[0] })
        const verification = await lottery.methods['verifications(address)'].call(accounts[0]);
        assert.equal(verification, true);

    })

    it('allows multiple users to enter', async () => {
        const lottery = await Lottery.new();
        let players = await lottery.methods['listPlayers()'].call({
            from: accounts[0]
        });
        assert.equal(0, players.length);
        await lottery.methods['verifyUser(string,uint256,address)'].sendTransaction("jwt", +(18), accounts[1], { from: accounts[1] })
        await lottery.methods['verifyUser(string,uint256,address)'].sendTransaction("jwt", +(18), accounts[0], { from: accounts[0] })
        await lottery.methods['enter()'].sendTransaction({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });
        await lottery.methods['enter()'].sendTransaction({ from: accounts[1], value: web3.utils.toWei('0.02', 'ether') });
        players = await lottery.methods['listPlayers()'].call({
            from: accounts[0]
        });
        assert.include(players, accounts[1]);
        assert.include(players, accounts[0])
        assert.equal(2, players.length)
    });

    it('enforces a minimum contribution', async () => {
        const lottery = await Lottery.new();

        try {
            await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.00', 'ether') });
            assert(false);
        } catch (err) {

            assert(err);
        }
    });

    it('only allows the manager to call pick winner', async () => {
        const lottery = await Lottery.new();
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert(false);
        } catch (err) {

            assert(err);
        }
    });
});

