'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TestProSearchPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    recipientName: 'John Doe',
    recipientCompany: 'Google',
    recipientRole: 'Software Engineer',
    searchMode: 'deep',
    testPhase: 'all'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const runTest = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/test-pro-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Test failed')
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pro Search Tester</h1>
          <p className="text-gray-600">
            Test the Pro search functionality and see detailed return formats for debugging.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Test Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipientCompany">Company</Label>
                  <Input
                    id="recipientCompany"
                    value={formData.recipientCompany}
                    onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                    placeholder="Google"
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipientRole">Role</Label>
                  <Input
                    id="recipientRole"
                    value={formData.recipientRole}
                    onChange={(e) => handleInputChange('recipientRole', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                
                <div>
                  <Label htmlFor="searchMode">Search Mode</Label>
                  <select
                    id="searchMode"
                    value={formData.searchMode}
                    onChange={(e) => handleInputChange('searchMode', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="deep">Deep Search</option>
                    <option value="basic">Basic Search</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="testPhase">Test Phase</Label>
                  <select
                    id="testPhase"
                    value={formData.testPhase}
                    onChange={(e) => handleInputChange('testPhase', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Phases</option>
                    <option value="phase1">Phase 1 Only</option>
                    <option value="phase2">Phase 2 Only</option>
                    <option value="phase3">Phase 3 Only</option>
                  </select>
                </div>
                
                <Button
                  onClick={runTest}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Run Pro Search Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="mt-2 text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {results && (
              <div className="space-y-6">
                {/* Test Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Test Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Timestamp:</span>
                        <p className="text-gray-600">{results.testInfo?.timestamp}</p>
                      </div>
                      <div>
                        <span className="font-medium">Search Mode:</span>
                        <p className="text-gray-600">{results.testInfo?.searchMode}</p>
                      </div>
                      <div>
                        <span className="font-medium">Test Phase:</span>
                        <p className="text-gray-600">{results.testInfo?.testPhase}</p>
                      </div>
                      <div>
                        <span className="font-medium">Recipient:</span>
                        <p className="text-gray-600">{results.testInfo?.recipientName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                {results.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {results.summary.totalSearchResults}
                          </div>
                          <div className="text-sm text-gray-600">Total Results</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {results.summary.totalErrors}
                          </div>
                          <div className="text-sm text-gray-600">Errors</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {results.summary.success ? '✓' : '✗'}
                          </div>
                          <div className="text-sm text-gray-600">Success</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Phase 1 Results */}
                {results.phase1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Phase 1: Initial SearchAPI Searches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results.phase1.error ? (
                        <div className="text-red-600">{results.phase1.error}</div>
                      ) : (
                        <div>
                          <div className="mb-4">
                            <span className="font-medium">Total Results:</span> {results.phase1.totalResults}
                          </div>
                          <div className="mb-4">
                            <span className="font-medium">Queries:</span>
                            <ul className="mt-2 space-y-1">
                              {results.phase1.queries?.map((query: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {query}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium">Results:</span>
                            <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                              {results.phase1.results?.map((result: any, index: number) => (
                                <div key={index} className="border border-gray-200 rounded p-3 bg-white">
                                  <div className="font-medium text-sm">{result.title}</div>
                                  <div className="text-sm text-gray-600 mt-1">{result.snippet}</div>
                                  <div className="text-xs text-blue-600 mt-1">{result.link}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Query: {result.query} | Phase: {result.phase}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Phase 2 Results */}
                {results.phase2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Phase 2: ChatGPT Generated Searches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results.phase2.error ? (
                        <div className="text-red-600">{results.phase2.error}</div>
                      ) : (
                        <div>
                          <div className="mb-4">
                            <span className="font-medium">Total Results:</span> {results.phase2.totalResults}
                          </div>
                          <div className="mb-4">
                            <span className="font-medium">Generated Queries:</span>
                            <ul className="mt-2 space-y-1">
                              {results.phase2.generatedQueries?.map((query: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {query}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium">Results:</span>
                            <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                              {results.phase2.results?.map((result: any, index: number) => (
                                <div key={index} className="border border-gray-200 rounded p-3 bg-white">
                                  <div className="font-medium text-sm">{result.title}</div>
                                  <div className="text-sm text-gray-600 mt-1">{result.snippet}</div>
                                  <div className="text-xs text-blue-600 mt-1">{result.link}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Query: {result.query} | Phase: {result.phase}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Phase 3 Results */}
                {results.phase3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Phase 3: Final Report Generation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results.phase3.error ? (
                        <div className="text-red-600">{results.phase3.error}</div>
                      ) : (
                        <div>
                          <div className="mb-4">
                            <span className="font-medium">Report Length:</span> {results.phase3.reportLength} characters
                          </div>
                          <div>
                            <span className="font-medium">Generated Report:</span>
                            <div className="mt-2 p-4 bg-gray-50 rounded border max-h-96 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-sm">{results.phase3.report}</pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Errors */}
                {results.errors && results.errors.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-700">Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.errors.map((error: string, index: number) => (
                          <li key={index} className="text-red-600 text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Raw Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>Raw JSON Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <pre className="text-xs bg-gray-100 p-4 rounded">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
} 