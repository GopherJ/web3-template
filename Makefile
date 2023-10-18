#!make

include .env
export $(shell sed 's/=.*//' .env)

SCRIPT_PATH              := ./scripts/dev/1.ad-hoc.ts

.PHONY: init
init: submodules

.PHONY: submodules
submodules:
	git submodule update --init --recursive

.PHONY: clean
clean:
	yarn clean

.PHONY: build
build: clean
	yarn build --network ${NETWORK}
	yarn typechain

.PHONY: size
size:
	yarn size

.PHONY: doc
doc:
	yarn doc

.PHONY: lint
lint:
	yarn lint

.PHONY: coverage
coverage:
	yarn coverage --no-compile

.PHONY: format
format:
	yarn format

.PHONY: hardhat
hardhat:
	npx hardhat node --hostname 0.0.0.0

.PHONY: anvil
anvil:
	anvil \
		$(if $(FORK),--fork-url https://eth-$(FORK).alchemyapi.io/v2/$(ALCHEMY_KEY) --chain-id 522 --no-rate-limit,--chain-id 31337) \
		$(if $(FORK_BLOCK_NUMBER),--fork-block-number $(FORK_BLOCK_NUMBER),) \
		$(if $(DEPLOYER_MNEMONIC),--mnemonic "${DEPLOYER_MNEMONIC}",--mnemonic "test test test test test test test test test test test junk") \
		--host 0.0.0.0 \
		--state-interval 60 \
		--dump-state state.json \
		$(if $(wildcard state.json),--load-state state.json,) \
		--disable-block-gas-limit \
		--code-size-limit 100000 \
		--timeout 9000000

.PHONY: run
run:
	npx hardhat run $(SCRIPT_PATH) --network $(NETWORK) --no-compile

.PHONY: run-task
run-task:
	DB_PATH=deployed-contracts.json npx hardhat $(TASK_NAME) $(ARG0) ${ARG1} ${ARG2} ${ARG3} --network $(NETWORK)

.PHONY: ad-hoc
ad-hoc:
	make SCRIPT_PATH=./scripts/dev/1.ad-hoc.ts run

.PHONY: wallet
wallet:
	make SCRIPT_PATH=./scripts/dev/2.wallet.ts run

.PHONY: info
info:
	make SCRIPT_PATH=./scripts/dev/3.info.ts run

.PHONY: set-interval-mining
set-interval-mining:
	make SCRIPT_PATH=./scripts/dev/4.set-interval-mining.ts run

.PHONY: set-auto-mining
set-auto-mining:
	make SCRIPT_PATH=./scripts/dev/4.set-auto-mining.ts run

.PHONY: print
print:
	make TASK_NAME=print-contracts run-task

.PHONY: verify
verify:
	make TASK_NAME=verify-contracts run-task

.PHONY: deploy
deploy:
	make TASK_NAME=deploy:all run-task

.PHONY: decode
decode:
	make TASK_NAME=decode run-task

.PHONY: decode-multi
decode-multi:
	make TASK_NAME=decode-multi run-task

.PHONY: decode-tx
decode-tx:
	make TASK_NAME=decode-tx run-task

.PHONY: increase-to-execution-time
increase-to-execution-time:
	make TASK_NAME=increase-to-execution-time run-task

.PHONY: decode-buffered-txs
decode-buffered-txs:
	make TASK_NAME=decode-buffered-txs run-task

.PHONY: decode-queued-txs
decode-queued-txs:
	make TASK_NAME=decode-queued-txs run-task

.PHONY: queue-buffered-txs
queue-buffered-txs:
	make TASK_NAME=queue-buffered-txs run-task

.PHONY: execute-buffered-txs
execute-buffered-txs:
	make TASK_NAME=execute-buffered-txs run-task

.PHONY: decode-safe-txs
decode-safe-txs:
	make TASK_NAME=decode-safe-txs run-task

.PHONY: propose-buffered-txs
propose-buffered-txs:
	make TASK_NAME=propose-buffered-txs run-task
