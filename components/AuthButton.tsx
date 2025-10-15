import React from 'react';
import { arbitrum } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const clientId = (import.meta as any).env?.VITE_THIRDWEB_CLIENT_ID || "";

const client = createThirdwebClient({
  clientId,
});

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "email",
        "x",
        "apple",
        "facebook",
        "tiktok",
        "twitch",
      ],
    },
  }),
];

export const AuthButton: React.FC<{ label?: string; includeMetamask?: boolean; className?: string; disableAA?: boolean }> = ({ label = "Accedi", includeMetamask = false, className = "", disableAA = false }) => {
  const baseWallets = [
    inAppWallet({
      auth: {
        options: [
          "google",
          "discord",
          "telegram",
          "email",
          "x",
          "apple",
          "facebook",
          "tiktok",
          "twitch",
        ],
      },
    }),
  ];
  const wallets = includeMetamask ? [createWallet("io.metamask"), ...baseWallets] : baseWallets;
  const accountAbstractionConfig = disableAA
    ? undefined
    : { chain: arbitrum, sponsorGas: true } as const;

  return (
    <ConnectButton
      accountAbstraction={accountAbstractionConfig}
      client={client}
      connectButton={{ label }}
      connectModal={{
        privacyPolicyUrl: "/privacy",
        showThirdwebBranding: false,
        size: "compact",
        termsOfServiceUrl: "/termini",
      }}
      theme={"light"}
      wallets={wallets}
      className={className || `inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-700 transition-colors`}
    />
  );
};

export default AuthButton;

