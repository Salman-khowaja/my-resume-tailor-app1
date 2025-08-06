export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { input } = body

    if (!input || typeof input !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Invalid input. Please provide ingredients or recipe idea.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get webhook URL from environment variable
    const webhookUrl = process.env.MAKE_WEBHOOK_URL
    
    console.log('Environment check:', {
      hasWebhookUrl: !!webhookUrl,
      webhookUrl: webhookUrl ? webhookUrl.substring(0, 50) + '...' : 'not set'
    })
    
    if (!webhookUrl) {
      console.log('No webhook URL configured, using fallback recipe generation')
      return new Response(JSON.stringify(generateFallbackRecipe(input)), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('=== WEBHOOK REQUEST START ===')
    console.log('Webhook URL:', webhookUrl)
    console.log('Ingredients:', input)
    console.log('Request payload:', { 
      ingredients: input,
      timestamp: new Date().toISOString()
    })

    // Send request to webhook with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Recipe-Generator/1.0'
        },
        body: JSON.stringify({ 
          ingredients: input,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('=== WEBHOOK RESPONSE ===')
      console.log('Status:', response.status)
      console.log('Status Text:', response.statusText)
      console.log('Headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Webhook error response body:', errorText)
        throw new Error(`Webhook responded with status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Webhook response data:', JSON.stringify(data, null, 2))
      console.log('=== WEBHOOK REQUEST END ===')

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Fetch error:', fetchError)
      throw fetchError
    }

  } catch (error) {
    console.error('=== RECIPE GENERATION ERROR ===')
    console.error('Error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Return fallback recipe on any error
    try {
      const body = await req.json().catch(() => ({}))
      const input = body.input || 'ingredients'
      
      console.log('Returning fallback recipe for:', input)
      return new Response(JSON.stringify(generateFallbackRecipe(input)), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      return new Response(JSON.stringify({ 
        error: 'Failed to generate recipe. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

function generateFallbackRecipe(input: string): any {
  const ingredients = input.toLowerCase().split(/[,\s]+/).filter(Boolean)
  
  // Simple recipe generation logic based on ingredients
  const recipes = [
    {
      title: "Quick Stir-Fry",
      ingredients: [
        "2 cups mixed vegetables",
        "1 tbsp olive oil",
        "2 cloves garlic, minced",
        "1 tbsp soy sauce",
        "Salt and pepper to taste"
      ],
      steps: [
        "Heat oil in a large pan over medium-high heat",
        "Add minced garlic and cook for 30 seconds until fragrant",
        "Add vegetables and stir-fry for 5-7 minutes until tender",
        "Season with soy sauce, salt, and pepper",
        "Serve hot and enjoy!"
      ]
    },
    {
      title: "Simple Pasta Dish",
      ingredients: [
        "8 oz pasta of your choice",
        "2 tbsp olive oil",
        "3 cloves garlic, minced",
        "1/4 cup grated cheese",
        "Fresh herbs (optional)",
        "Salt and pepper to taste"
      ],
      steps: [
        "Cook pasta according to package instructions",
        "Heat olive oil in a pan and sauté garlic until golden",
        "Drain pasta and add to the pan with garlic",
        "Toss with cheese and season with salt and pepper",
        "Garnish with fresh herbs if available"
      ]
    },
    {
      title: "Easy Rice Bowl",
      ingredients: [
        "1 cup cooked rice",
        "1 cup mixed vegetables",
        "1 tbsp cooking oil",
        "2 tbsp soy sauce",
        "1 egg (optional)",
        "Sesame seeds for garnish"
      ],
      steps: [
        "Cook rice according to package instructions",
        "Sauté vegetables in oil until tender",
        "Add cooked rice and soy sauce, stir well",
        "If using egg, scramble it separately and add on top",
        "Garnish with sesame seeds and serve"
      ]
    },
    {
      title: "Mexican-Inspired Wrap",
      ingredients: [
        "2 large tortillas",
        "1 cup cooked chicken, shredded",
        "1 cup diced tomatoes",
        "1/2 cup shredded cheese",
        "2 cloves garlic, minced",
        "1 tbsp olive oil",
        "Salt and pepper to taste"
      ],
      steps: [
        "Heat oil in a pan and sauté garlic until fragrant",
        "Add shredded chicken and cook until heated through",
        "Warm tortillas in a dry pan for 30 seconds each side",
        "Fill tortillas with chicken, tomatoes, and cheese",
        "Fold and serve immediately"
      ]
    }
  ]

  // Select recipe based on ingredients
  let selectedRecipe = recipes[0]
  
  if (ingredients.some(ing => ['pasta', 'noodles', 'spaghetti'].includes(ing))) {
    selectedRecipe = recipes[1]
  } else if (ingredients.some(ing => ['rice', 'vegetables', 'veggies'].includes(ing))) {
    selectedRecipe = recipes[2]
  } else if (ingredients.some(ing => ['tortilla', 'chicken', 'tomatoes'].includes(ing))) {
    selectedRecipe = recipes[3]
  }

  // Customize ingredients based on input
  const customIngredients = ingredients.length > 0 ? 
    ingredients.map(ing => `${ing} (as available)`) : 
    selectedRecipe.ingredients

  return {
    title: selectedRecipe.title,
    ingredients: customIngredients,
    steps: selectedRecipe.steps
  }
}
