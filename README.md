# PainDrain 🩺💬

*Bridging the gap between patient suffering and medical understanding*

## 🌟 Overview

PainDrain is a revolutionary AI-powered medical communication platform that transforms patient pain descriptions into precise medical terminology. Built with GPT-5, it solves healthcare's most fundamental communication problem: helping patients accurately describe their symptoms to healthcare providers.

## 🎯 The Problem

- **$750 billion** lost annually due to misdiagnosis in US healthcare
- **70%** of misdiagnoses attributed to poor patient-provider communication
- **50+ million** Americans suffer from chronic pain with inadequate communication tools
- Patients struggle to articulate pain experiences in medically useful terms

## ⚡ Core Features

### 🔄 Instant Pain Translation
- Transform colloquial pain descriptions into medical terminology
- Real-time processing with GPT-5 integration
- Confidence scoring for diagnostic accuracy
- ICD-10 compatible diagnostic suggestions

### 🗺️ Interactive Anatomical Visualization
- 2D/3D body mapping for precise pain location
- Multi-layer anatomical views (skin, muscle, skeleton, organs)
- Pain heat mapping with intensity overlays
- Rotatable 3D models for detailed visualization

### 📊 Pain Timeline Tracker
- Longitudinal pain pattern analysis
- Trigger identification (weather, stress, activities)
- Predictive flare-up alerts
- Progress tracking and trend analysis

### 💝 Pain Empathy Engine
- Generate personalized analogies for family/friends understanding
- Audience-specific explanations (doctors vs. family vs. colleagues)
- Cultural and personal context integration
- Transform invisible pain into relatable experiences

## 🛠️ Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **AI/ML**: GPT-5 via aimlapi.com
- **Visualization**: Three.js for 3D anatomical models
- **Database**: Medical terminology and ICD-10 mapping
- **Authentication**: Secure, HIPAA-aware session management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- GPT-5 API key from aimlapi.com

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/paindrain.git
cd paindrain

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GPT-5 API key and other configurations

# Start development server
npm run dev
```

### Environment Variables (GCP Secrets)

```AIML_API_KEY=your-AI/ML-API-key```
```

## 📝 API Documentation

### Pain Translation Endpoint
```http
POST /api/translate-pain
Content-Type: application/json

{
  "description": "My head feels like it's in a vice grip",
  "intensity": 8,
  "location": "head",
  "duration": "2 hours"
}
```

**Response:**
```json
{
  "medicalTranslation": "Bilateral cephalgia with pressure-type quality",
  "icd10Codes": ["G44.2"],
  "diagnosticSuggestions": [
    {
      "diagnosis": "Tension-type headache",
      "confidence": 87,
      "description": "Primary headache disorder characterized by bilateral pressure-type pain"
    }
  ],
  "recommendedQuestions": [
    "What triggers typically precede these episodes?",
    "Have you experienced any visual disturbances?"
  ]
}
```

## 🎯 Use Cases

### For Patients
- Prepare for doctor appointments with accurate symptom descriptions
- Track pain patterns over time
- Help family understand their pain experience
- Generate professional medical reports

### For Healthcare Providers
- Receive precise, medically relevant symptom documentation
- Access longitudinal pain data and patterns
- Improve diagnostic accuracy through better communication
- Save time on symptom interpretation

### For Telemedicine Platforms
- Enhance remote consultation quality
- Standardize symptom documentation
- Improve patient-provider communication
- Enable better triage and care coordination

## 🔒 Privacy & Security

- **No Data Storage**: Session-based processing only
- **HIPAA Awareness**: Privacy-first design principles
- **Medical Disclaimers**: Clear guidance on professional consultation needs
- **Secure API Communication**: Encrypted data transmission

## 🧪 Demo Examples

### Example 1: Chronic Back Pain
**Input:** "My lower back feels like someone is twisting a knife when I bend over"
**Output:** "Acute lumbar pain, sharp quality, exacerbated by spinal flexion, consistent with possible disc herniation (ICD-10: M51.9) - Confidence: 92%"

### Example 2: Headache Description
**Input:** "Pounding behind my eyes, like my head might explode"
**Output:** "Bilateral cephalgia with retro-orbital pressure and throbbing quality, suggestive of tension-type headache or migraine (ICD-10: G44.1) - Confidence: 85%"

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📈 Roadmap

- [ ] **V1.0**: Core translation and visualization features
- [ ] **V1.1**: Pain Timeline Tracker implementation  
- [ ] **V1.2**: Pain Empathy Engine rollout
- [ ] **V2.0**: Healthcare provider dashboard
- [ ] **V2.1**: Mobile app development
- [ ] **V3.0**: Integration with EMR systems

## 🏆 Hackathon Achievement

Built during the **Co-Creating with GPT-5** hackathon, PainDrain demonstrates the transformative potential of advanced AI in healthcare communication.

## 📊 Market Impact

- **Target Market**: $280B global healthcare communication market
- **Addressable Users**: 130M+ patients with chronic conditions
- **Revenue Model**: B2B SaaS for healthcare providers, freemium for patients
- **Scaling Potential**: Integration with major EMR and telemedicine platforms

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using GPT-5,  aimlapi.com and Firebase Studio

---

**Made with 💊 by the PainDrain Team**

Seth - https://github.com/SethThirdson
Bernard - https://github.com/Bernard-github-account

*Transforming pain communication, one description at a time.*