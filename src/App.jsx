import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useState } from "react";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  async function getTokenBalance() {
    setIsLoading(true);
    const config = {
      apiKey: "<-- COPY-PASTE YOUR ALCHEMY API KEY HERE -->",
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(userAddress);

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setIsLoading(false);
    setHasQueried(true);
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          Check ERC-20 Token Balances
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {isLoading ? (
          <Spinner size="xl" />
        ) : hasQueried ? (
          <SimpleGrid w={"90vw"} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="blue"
                  w={"20vw"}
                  key={i}
                  p={4}
                  borderWidth={1}
                  borderRadius={4}
                  boxShadow="md"
                >
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  <Box mt={2} mb={2}>
                    <Image
                      src={tokenDataObjects[i].logo}
                      objectFit="contain"
                      w="100%"
                      h="100px"
                      fallbackSrc="https://via.placeholder.com/100"
                    />
                  </Box>
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          <Text>Please make a query! This may take a few seconds...</Text>
        )}
      </Flex>
    </Box>
  );
}

export default App;
