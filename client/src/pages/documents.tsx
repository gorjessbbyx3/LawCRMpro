import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Download, Eye, Upload } from "lucide-react";
import { format } from "date-fns";
import type { Document } from "@shared/schema";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const getDocumentIcon = (mimeType: string | null) => {
    if (!mimeType) return <FileText className="w-5 h-5" />;
    
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes("word")) return <FileText className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes("image")) return <FileText className="w-5 h-5 text-green-500" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
        <Button data-testid="button-upload-document">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-documents"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48" data-testid="select-document-type">
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="motion">Motions</SelectItem>
            <SelectItem value="correspondence">Correspondence</SelectItem>
            <SelectItem value="evidence">Evidence</SelectItem>
            <SelectItem value="brief">Briefs</SelectItem>
            <SelectItem value="pleading">Pleadings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Document Templates Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Document Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Motion to Dismiss",
              "Settlement Agreement",
              "Client Retainer",
              "Discovery Request",
              "Non-Disclosure Agreement",
              "Cease and Desist",
              "Power of Attorney",
              "Will Template"
            ].map((template) => (
              <Button
                key={template}
                variant="outline"
                className="h-auto p-3 text-left justify-start"
                data-testid={`template-${template.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div>
                  <p className="font-medium text-sm">{template}</p>
                  <p className="text-xs text-muted-foreground">Template</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document: Document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow" data-testid={`card-document-${document.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  {getDocumentIcon(document.mimeType)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate" data-testid={`document-name-${document.id}`}>
                      {document.name}
                    </CardTitle>
                    {document.documentType && (
                      <Badge variant="secondary" className="text-xs mt-1" data-testid={`document-type-${document.id}`}>
                        {document.documentType.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <p data-testid={`file-size-${document.id}`}>
                  Size: {formatFileSize(document.fileSize)}
                </p>
                <p data-testid={`upload-date-${document.id}`}>
                  Uploaded: {format(new Date(document.createdAt), "MMM d, yyyy")}
                </p>
                {document.version && document.version > 1 && (
                  <p data-testid={`version-${document.id}`}>
                    Version: {document.version}
                  </p>
                )}
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1" data-testid={`tags-${document.id}`}>
                  {document.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-${document.id}`}>
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1" data-testid={`button-download-${document.id}`}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground" data-testid="text-no-documents">
            {searchTerm || filterType !== "all" 
              ? "No documents found matching your criteria." 
              : "No documents uploaded yet. Upload your first document to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
