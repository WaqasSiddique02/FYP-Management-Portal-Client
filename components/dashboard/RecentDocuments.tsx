'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Presentation, File } from 'lucide-react';

interface RecentDocumentsProps {
  documents: {
    documentsCount: number;
    recentDocuments: Array<{
      fileName: string;
      type: string;
      description: string;
    }>;
  };
}

export default function RecentDocuments({ documents }: RecentDocumentsProps) {
  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'presentation':
        return <Presentation className="h-5 w-5 text-orange-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      presentation: 'bg-orange-100 text-orange-800',
      document: 'bg-blue-100 text-blue-800',
      report: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge className={colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
          <Badge variant="secondary">{documents.documentsCount} Total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {documents.recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {documents.recentDocuments.map((doc, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="mt-0.5">
                  {getDocumentIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate text-sm">{doc.fileName}</p>
                    {getTypeBadge(doc.type)}
                  </div>
                  <p className="text-xs text-gray-600">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}