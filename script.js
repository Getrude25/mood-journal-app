// Data storage for journal entries
        let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        let moodChart;
        let currentPlan = 'free';
        let API_BASE_URL = 'https://your-backend-url.onrender.com/api';
        
        // Initialize the chart
        function initChart() {
            const ctx = document.getElementById('mood-chart').getContext('2d');
            moodChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Mood Score',
                        data: [],
                        borderColor: '#6c63ff',
                        backgroundColor: 'rgba(108, 99, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 0,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Mood: ${context.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
            
            updateChart();
        }
        
        // Update chart with stored data
        function updateChart() {
            if (journalEntries.length > 0) {
                const labels = journalEntries.map(entry => {
                    const date = new Date(entry.timestamp);
                    return date.toLocaleDateString();
                });
                
                const data = journalEntries.map(entry => entry.score);
                
                moodChart.data.labels = labels;
                moodChart.data.datasets[0].data = data;
                moodChart.update();
            }
        }
        
        // Save journal entry
        function saveEntry() {
            const entryText = document.getElementById('journal-entry').value;
            if (!entryText) {
                alert('Please write something in your journal first!');
                return;
            }
            
            // Check if user has reached free plan limit
            if (currentPlan === 'free' && journalEntries.length >= 5) {
                alert('You have reached the limit of 5 entries on the free plan. Upgrade to Premium for unlimited entries.');
                document.getElementById('pricing').scrollIntoView();
                return;
            }
            
            // Analyze sentiment
            const sentiment = analyzeSentiment(entryText);
            
            // Create entry object
            const entry = {
                text: entryText,
                score: sentiment.score,
                sentiment: sentiment.type,
                timestamp: new Date().toISOString(),
                emotion: document.querySelector('.emotion-btn.selected')?.dataset.emotion || 'neutral'
            };
            
            // Add to entries array
            journalEntries.push(entry);
            
            // Save to localStorage
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            
            // Update UI
            updateEntryList();
            updateChart();
            generateInsights();
            
            // Clear textarea
            document.getElementById('journal-entry').value = '';
            
            // Show confirmation
            alert('Journal entry saved successfully!');
        }
        
        // Analyze mood without saving
        function analyzeMood() {
            const entryText = document.getElementById('journal-entry').value;
            if (!entryText) {
                alert('Please write something in your journal first!');
                return;
            }
            
            // Show loading state
            document.getElementById('mood-result').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            
            // Simulate API call delay
            setTimeout(() => {
                const sentiment = analyzeSentiment(entryText);
                
                // Display result
                displayAnalysisResult(sentiment);
            }, 1000);
        }
        
        // Sentiment analysis function
        function analyzeSentiment(text) {
            // Mock sentiment analysis based on keywords
            let score = 50;
            let type = 'neutral';
            
            const positiveWords = ['happy', 'joy', 'excited', 'good', 'great', 'love', 'wonderful', 'amazing', 'best', 'grateful', 'calm', 'peaceful'];
            const negativeWords = ['sad', 'angry', 'hate', 'bad', 'terrible', 'awful', 'worst', 'depressed', 'anxious', 'tired', 'stress'];
            
            let positiveCount = 0;
            let negativeCount = 0;
            
            positiveWords.forEach(word => {
                const regex = new RegExp(word, 'gi');
                const matches = text.match(regex);
                if (matches) positiveCount += matches.length;
            });
            
            negativeWords.forEach(word => {
                const regex = new RegExp(word, 'gi');
                const matches = text.match(regex);
                if (matches) negativeCount += matches.length;
            });
            
            if (positiveCount > negativeCount) {
                type = 'positive';
                score = 70 + (positiveCount * 5);
            } else if (negativeCount > positiveCount) {
                type = 'negative';
                score = 30 - (negativeCount * 5);
            }
            
            // Ensure score is within 0-100 range
            score = Math.max(0, Math.min(100, score));
            
            return { score, type };
        }
        
        // Display analysis result
        function displayAnalysisResult(sentiment) {
            let emoji, text, moodClass;
            
            if (sentiment.type === 'positive') {
                emoji = '😊';
                text = `Positive (${sentiment.score}% happy)`;
                moodClass = 'mood-positive';
            } else if (sentiment.type === 'negative') {
                emoji = '😢';
                text = `Negative (${100 - sentiment.score}% sad)`;
                moodClass = 'mood-negative';
            } else {
                emoji = '😐';
                text = `Neutral (${sentiment.score}%)`;
                moodClass = 'mood-neutral';
            }
            
            document.getElementById('mood-emoji').textContent = emoji;
            document.getElementById('mood-result').textContent = text;
        }
        
        // Update entry list in UI
        function updateEntryList() {
            const container = document.getElementById('entries-container');
            container.innerHTML = '';
            
            if (journalEntries.length === 0) {
                container.innerHTML = '<p>No entries yet. Start journaling to see your history here.</p>';
                return;
            }
            
            // Show latest entries first
            const reversedEntries = [...journalEntries].reverse();
            
            reversedEntries.forEach((entry, index) => {
                const date = new Date(entry.timestamp);
                const entryElement = document.createElement('div');
                entryElement.className = 'entry-item';
                entryElement.innerHTML = `
                    <div class="entry-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
                    <div class="mood-tag mood-${entry.sentiment}">${entry.sentiment}</div>
                    <div class="entry-preview">${entry.text.substring(0, 50)}${entry.text.length > 50 ? '...' : ''}</div>
                `;
                
                entryElement.addEventListener('click', () => {
                    displayEntryDetails(entry);
                });
                
                container.appendChild(entryElement);
            });
        }
        
        // Display entry details
        function displayEntryDetails(entry) {
            document.getElementById('journal-entry').value = entry.text;
            
            // Select the emotion button if it exists
            document.querySelectorAll('.emotion-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.emotion === entry.emotion) {
                    btn.classList.add('selected');
                }
            });
            
            // Show analysis
            displayAnalysisResult({score: entry.score, type: entry.sentiment});
        }
        
        // Initialize emotion buttons
        function initEmotionButtons() {
            document.querySelectorAll('.emotion-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }
        
        // Generate insights based on journal entries
        function generateInsights() {
            if (journalEntries.length < 3) {
                document.getElementById('insight-1').textContent = "Keep journaling to unlock personalized insights";
                document.getElementById('insight-2').textContent = "We need more data to analyze your patterns";
                document.getElementById('insight-3').textContent = "Journal daily for the best results";
                return;
            }
            
            // Mock insights based on sentiment data
            const positiveEntries = journalEntries.filter(entry => entry.sentiment === 'positive').length;
            const positivePercentage = Math.round((positiveEntries / journalEntries.length) * 100);
            
            document.getElementById('insight-1').textContent = `You've been positive ${positivePercentage}% of the time`;
            
            // Check if there are more positive entries in the morning
            const morningEntries = journalEntries.filter(entry => {
                const hour = new Date(entry.timestamp).getHours();
                return hour >= 6 && hour < 12;
            });
            
            const positiveMorningEntries = morningEntries.filter(entry => entry.sentiment === 'positive').length;
            
            if (morningEntries.length > 0) {
                const morningPositivePercentage = Math.round((positiveMorningEntries / morningEntries.length) * 100);
                if (morningPositivePercentage > positivePercentage) {
                    document.getElementById('insight-2').textContent = "You tend to be more positive in the mornings";
                } else {
                    document.getElementById('insight-2').textContent = "Your positivity increases as the day goes on";
                }
            }
            
            // Check for recent trend
            const recentEntries = journalEntries.slice(-7);
            if (recentEntries.length > 2) {
                const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.score, 0) / recentEntries.length;
                const overallAvg = journalEntries.reduce((sum, entry) => sum + entry.score, 0) / journalEntries.length;
                
                if (recentAvg > overallAvg + 10) {
                    document.getElementById('insight-3').textContent = "Your mood has been improving recently";
                } else if (recentAvg < overallAvg - 10) {
                    document.getElementById('insight-3').textContent = "You've been feeling down lately - consider talking to someone";
                } else {
                    document.getElementById('insight-3').textContent = "Your mood has been stable recently";
                }
            }
        }
        
        // Show payment form
        function showPaymentForm(planType) {
            document.getElementById('payment').style.display = 'block';
            document.getElementById('plan').value = planType;
            document.getElementById('payment').scrollIntoView();
        }
        
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                this.classList.add('selected');
                
                // Update payment button text
                const methodName = this.querySelector('div').textContent;
                document.querySelector('.btn-success').innerHTML = 
                    `<i class="fas fa-lock"></i> Complete Payment via ${methodName}`;
            });
        });
        
        // Process payment function
        function processPayment() {
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const plan = document.getElementById('plan').value;
            
            if (!email || !phone) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Show loading state
            const payBtn = document.querySelector('.btn-success');
            const originalText = payBtn.innerHTML;
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            payBtn.disabled = true;
            
            // Simulate API call to backend
            setTimeout(() => {
                // In a real implementation, this would:
                // 1. Send payment request to your backend
                // 2. Your backend would integrate with ClickPesa API
                // 3. Redirect user to ClickPesa payment page
                
                // For demo purposes, we'll simulate a successful payment
                simulateClickPesaRedirect();
            }, 2000);
        }
        
        // Simulate ClickPesa redirect
        function simulateClickPesaRedirect() {
            // In a real implementation, this would redirect to ClickPesa
            // window.location.href = 'https://clickpesa.com/payment/...';
            
            // For demo, show success modal after a delay
            setTimeout(() => {
                // Show success modal
                document.getElementById('successModal').style.display = 'flex';
                
                // Upgrade user account
                currentPlan = 'premium';
                alert('Your account has been upgraded to Premium! You now have unlimited journal entries.');
                
                // Reset button
                const payBtn = document.querySelector('.btn-success');
                payBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Payment via ClickPesa';
                payBtn.disabled = false;
            }, 1500);
        }
        
        // Close modal
        function closeModal() {
            document.getElementById('successModal').style.display = 'none';
        }
        
        // Initialize the application
        function initApp() {
            initChart();
            initEmotionButtons();
            updateEntryList();
            generateInsights();
            
            // Add some sample data if no entries exist
            if (journalEntries.length === 0) {
                const sampleEntries = [
                    {
                        text: "Had a great day today! Finished all my tasks and had time to relax in the evening.",
                        score: 85,
                        sentiment: "positive",
                        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                        emotion: "happy"
                    },
                    {
                        text: "Feeling a bit anxious about the upcoming presentation. I need to prepare better.",
                        score: 35,
                        sentiment: "negative",
                        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        emotion: "anxious"
                    },
                    {
                        text: "The meeting went better than expected! My boss appreciated my suggestions.",
                        score: 90,
                        sentiment: "positive",
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        emotion: "excited"
                    }
                ];
                
                journalEntries = sampleEntries;
                localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
                updateEntryList();
                updateChart();
                generateInsights();
            }
        }
        
        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', initApp);
