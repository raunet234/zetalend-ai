Brief description: "ZetaLend is a cross-chain lending protocol built on ZetaChain where users can deposit ETH on Ethereum Sepolia and borrow USDT on BSC Testnet. It integrates AI-based credit scoring and fraud detection."
flowchart TD
    %% User Interface Layer
    User[👤 User] --> Wallet[🦊 MetaMask/WalletConnect]
    Wallet --> Frontend[🖥️ Next.js Frontend]
    
    %% Authentication & Connection
    Frontend --> Auth{Wallet Connected?}
    Auth -->|No| WalletConnect[Connect Wallet]
    Auth -->|Yes| Dashboard[📊 User Dashboard]
    WalletConnect --> Dashboard
    
    %% Main Actions
    Dashboard --> Action{Select Action}
    Action --> Deposit[💰 Deposit Assets]
    Action --> Borrow[🏦 Borrow Assets]
    Action --> Repay[💳 Repay Loan]
    Action --> Monitor[📈 Monitor Positions]
    
    %% Deposit Flow
    Deposit --> DepositChain[Select Source Chain]
    DepositChain --> DepositAsset[Select Asset & Amount]
    DepositAsset --> DepositTx[Submit Transaction]
    DepositTx --> ZetaDeposit[ZetaChain Smart Contract]
    
    %% AI Analysis Flow
    ZetaDeposit --> AIAnalysis[🤖 Gemini AI Analysis]
    AIAnalysis --> WalletHistory[Analyze Wallet History]
    AIAnalysis --> CreditScore[Generate Credit Score]
    AIAnalysis --> FraudCheck[Fraud Detection]
    
    WalletHistory --> ScoreCalc[Credit Score Calculation]
    ScoreCalc --> ScoreFactors[Transaction Volume<br/>DeFi Usage<br/>Repayment History<br/>Wallet Age<br/>Risk Patterns]
    
    FraudCheck --> FraudFactors[Velocity Checks<br/>Pattern Recognition<br/>Cross-Chain Analysis<br/>Blacklist Check]
    
    %% Risk Management
    CreditScore --> RiskEngine[🛡️ Risk Management Engine]
    FraudFactors --> RiskEngine
    RiskEngine --> LTVCalc[Calculate Dynamic LTV]
    RiskEngine --> RiskAssessment{Risk Assessment}
    
    RiskAssessment -->|High Risk| RejectLoan[❌ Reject Loan]
    RiskAssessment -->|Medium Risk| AdjustTerms[⚖️ Adjust Loan Terms]
    RiskAssessment -->|Low Risk| ApproveLoan[✅ Approve Loan]
    
    %% Borrowing Flow
    Borrow --> AIRecommendation[🎯 AI Loan Recommendation]
    AIRecommendation --> BorrowChain[Select Target Chain]
    BorrowChain --> BorrowAsset[Select Asset & Amount]
    BorrowAsset --> LoanRequest[Submit Loan Request]
    
    LoanRequest --> RiskEngine
    AdjustTerms --> LoanApproval[Loan Approval Process]
    ApproveLoan --> LoanApproval
    
    %% Cross-Chain Execution
    LoanApproval --> CrossChainTx[🌉 ZetaChain Cross-Chain Transfer]
    CrossChainTx --> TargetChain[Target Blockchain]
    TargetChain --> AssetTransfer[Transfer Borrowed Asset]
    AssetTransfer --> UserWallet[💼 User Receives Assets]
    
    %% Monitoring & Notifications
    UserWallet --> MonitoringSystem[📡 Real-Time Monitoring]
    MonitoringSystem --> TxTracking[Transaction Tracking]
    MonitoringSystem --> LiquidationCheck[Liquidation Monitoring]
    MonitoringSystem --> Notifications[📱 Push Notifications]
    
    %% Liquidation Flow
    LiquidationCheck --> LiquidationRisk{Approaching Liquidation?}
    LiquidationRisk -->|Yes| Warning[⚠️ Liquidation Warning]
    LiquidationRisk -->|Critical| AutoLiquidation[🔴 Automatic Liquidation]
    Warning --> GracePeriod[24hr Grace Period]
    GracePeriod --> AddCollateral{User Adds Collateral?}
    AddCollateral -->|Yes| SafePosition[✅ Position Safe]
    AddCollateral -->|No| AutoLiquidation
    
    %% Repayment Flow
    Repay --> RepayChain[Select Repayment Chain]
    RepayChain --> RepayAmount[Enter Repayment Amount]
    RepayAmount --> RepayTx[Submit Repayment]
    RepayTx --> CrossChainRepay[Cross-Chain Repayment]
    CrossChainRepay --> LoanUpdate[Update Loan Status]
    LoanUpdate --> CreditScoreUpdate[Update Credit Score]
    
    %% Error Handling
    CrossChainTx --> TxStatus{Transaction Success?}
    TxStatus -->|Failed| RetryMechanism[🔄 Retry with Backoff]
    TxStatus -->|Timeout| AutoRollback[↩️ Automatic Rollback]
    TxStatus -->|Success| UserWallet
    RetryMechanism --> TxStatus
    AutoRollback --> RefundUser[💸 Refund User]
    
    %% Admin Controls
    AdminPanel[👨‍💼 Admin Panel] --> EmergencyPause[⏸️ Emergency Pause]
    AdminPanel --> SystemMonitoring[📊 System Health]
    AdminPanel --> RiskParameters[⚙️ Adjust Risk Parameters]
    
    %% Styling
    classDef userInterface fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef aiProcess fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef riskManagement fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef blockchain fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef monitoring fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef admin fill:#fff8e1,stroke:#ffa000,stroke-width:2px
    
    class User,Wallet,Frontend,Dashboard userInterface
    class AIAnalysis,WalletHistory,CreditScore,FraudCheck,AIRecommendation aiProcess
    class RiskEngine,LTVCalc,RiskAssessment,AutoLiquidation riskManagement
    class ZetaDeposit,CrossChainTx,TargetChain,AssetTransfer blockchain
    class MonitoringSystem,TxTracking,LiquidationCheck,Notifications monitoring
    class AdminPanel,EmergencyPause,SystemMonitoring admin