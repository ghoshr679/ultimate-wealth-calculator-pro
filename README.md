# Ultimate Wealth Calculator Pro 💰

A professional-grade wealth planning dashboard built with React, TypeScript, and Tailwind CSS. Plan your financial future with advanced calculations, scenario comparisons, and risk assessment.

## ✨ Features

### 📊 Core Features
- **Wealth Projection Calculator**: Calculate investment growth with compound interest
- **Multi-Currency Support**: INR, USD, EUR, GBP, AUD, CAD, AED, SGD
- **Inflation Adjustment**: Real-time inflation impact on purchasing power
- **Monthly Projections**: Month-by-month breakdown of your wealth growth
- **Goal Tracking**: Set and track multiple financial goals simultaneously
- **Dark/Light Mode**: Professional theme switching with persistence

### 🎯 Advanced Tools
- **Scenario Comparison**: Compare multiple investment strategies side-by-side
- **Risk Profile Calculator**: Assess your risk tolerance with asset allocation recommendations
- **Rate Comparison Matrix**: Analyze different return rates and their impact
- **Historical Inflation Analysis**: Compare past and future inflation scenarios

### 📈 Analytics & Insights
- **Interactive Charts**: Visualize wealth growth projections
- **ROI Analysis**: Compound ROI and CAGR calculations
- **Milestone Tracking**: Monitor progress toward financial goals (25%, 50%, 75%, 100%)
- **Real-Time Calculations**: Instant feedback as you adjust inputs

### 💾 Data Management
- **Local Storage**: Automatic saving of your calculations
- **CSV Export**: Export projections for spreadsheet analysis
- **JSON Export**: Complete data export for backup or sharing
- **Print Support**: PDF export via browser print functionality
- **Copy Reports**: One-click report summary to clipboard

### ♿ Accessibility
- **ARIA Labels**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Dark and light modes for visibility
- **Semantic HTML**: Proper document structure

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ghoshr679/ultimate-wealth-calculator-pro.git
   cd ultimate-wealth-calculator-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**: Repository is already set up
2. **Connect to Vercel**: Visit https://vercel.com/new
3. **Import repository**: Select `ultimate-wealth-calculator-pro`
4. **Deploy**: Click deploy - automatic builds on each push

### Other Platforms

The app is a Vite + React SPA and can be deployed to:
- **Netlify**: Drag & drop the `dist` folder
- **GitHub Pages**: Configure static site hosting
- **AWS S3 + CloudFront**: Follow AWS documentation
- **Railway, Render, Heroku**: Standard Node.js deployment

## 🎮 How to Use

### Basic Workflow

1. **Configure Your Goal**
   - Set goal name and target amount
   - Enter initial investment and monthly contribution
   - Specify expected monthly return rate

2. **View Dashboard**
   - See key metrics at a glance
   - Monitor time to reach your goal
   - Track milestones and achievements

3. **Analyze Projections**
   - View month-by-month breakdown
   - Study interactive growth chart
   - Compare with different inflation rates

4. **Compare Scenarios**
   - Adjust parameters and save scenarios
   - Compare multiple investment strategies
   - Export for detailed analysis

5. **Assess Risk**
   - Complete 5-question risk assessment
   - Get personalized asset allocation
   - Understand your risk profile

### Input Fields

| Field | Description | Range |
|-------|-------------|-------|
| Goal Name | Name of your financial goal | Text |
| Initial Investment | Starting capital | ≥ 0 |
| Monthly Contribution | Recurring investment (SIP) | ≥ 0 |
| Target Amount | Your wealth goal | > Initial Investment |
| Monthly Return Rate | Expected monthly return % | -20% to 50% |
| Inflation Rate | Expected annual inflation % | -10% to 25% |

## 🔧 Technical Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom configurations
- **Build Tool**: Vite 6
- **Icons**: Lucide React
- **Animations**: Motion for React
- **Storage**: Browser LocalStorage API
- **Export**: CSV and JSON via Blob API

## 📊 Calculations

### Compound Interest Formula
```
Future Value = P(1 + r)^n + PMT × [((1 + r)^n - 1) / r]
```

Where:
- P = Initial investment
- r = Monthly rate (as decimal)
- n = Number of months
- PMT = Monthly contribution

### CAGR (Compound Annual Growth Rate)
```
CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
```

### Inflation Adjustment
```
Real Value = Nominal Value / (1 + Inflation Rate)^Years
```

## 🎨 Customization

### Theme Customization
Edit `src/index.css` to modify:
- Color palette
- Font families
- Spacing scale
- Border radius

### Calculator Parameters
Modify `src/utils/helpers.ts`:
- Add new currencies to `CURRENCIES` array
- Adjust calculation limits in `calculateWealthProjection()`
- Customize validation rules in `validateInputs()`

## 🐛 Known Limitations

- Maximum calculation period: 100 years
- Assumes constant monthly return rate
- Does not account for taxes or fees
- Inflation adjustment is simplified
- No multi-goal optimization (yet)

## 📝 License

MIT License - see LICENSE file for details

## 👤 Developer

**SSB100Million / Rahul Ghosh**
- 📱 Telegram: [@ssb100million](https://t.me/ssb100million)
- 📧 Email: ghoshrahul4455@gmail.com
- 🐦 Twitter: [@ghoshrahul4455](https://twitter.com/ghoshrahul4455)

## 🙏 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Investment Disclaimer

Wealth projections provided by Ultimate Wealth Calculator Pro are estimates modeled on compound interest formulations. Actual market investments fluctuate dynamically based on market performance, taxation, capital fees, and specific asset risks. Always perform professional financial consultations before making investment decisions.

## 🎯 Roadmap

- [ ] Multi-goal optimization
- [ ] Portfolio recommendations
- [ ] Historical return data API
- [ ] Expense tracking
- [ ] Tax calculator
- [ ] Mobile app (React Native)
- [ ] Collaborative planning
- [ ] Advanced charting library

## 📞 Support

For issues, questions, or suggestions:
- Open an [GitHub Issue](https://github.com/ghoshr679/ultimate-wealth-calculator-pro/issues)
- Contact via Telegram or email

---

**Built with ❤️ for wealth planning enthusiasts worldwide**
