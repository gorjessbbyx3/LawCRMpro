import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText, Download, Eye, Upload, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Document } from "@shared/schema";
import { HAWAII_COURT_FORMS, FORM_CATEGORIES, getFormsByCategory, searchForms } from "@shared/hawaiiCourtForms";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("my-documents");
  const { toast } = useToast();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: {
      uploadURL: string;
      name: string;
      filename: string;
      fileSize: number;
      mimeType: string;
      documentType?: string;
      caseId?: string;
      clientId?: string;
      tags?: string[];
    }) => {
      const response = await apiRequest("PUT", "/api/documents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const uploadedFile = result.successful?.[0];
    if (uploadedFile && uploadedFile.uploadURL) {
      uploadMutation.mutate({
        uploadURL: uploadedFile.uploadURL as string,
        name: uploadedFile.name as string,
        filename: uploadedFile.name as string,
        fileSize: uploadedFile.size || 0,
        mimeType: uploadedFile.type || "application/octet-stream",
        documentType: filterType !== "all" ? filterType : undefined,
        tags: [],
      });
    }
  };

  const handleDownload = (document: Document) => {
    window.open(document.filePath, "_blank");
  };

  const filteredDocuments = (documents as Document[]).filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const filteredForms = searchTerm
    ? searchForms(searchTerm)
    : HAWAII_COURT_FORMS;

  const getDocumentIcon = (mimeType: string | null) => {
    if (!mimeType) return <FileText className="w-5 h-5" />;
    
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />;
    if (mimeType.includes("word")) return <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    if (mimeType.includes("image")) return <FileText className="w-5 h-5 text-green-500 dark:text-green-400" />;
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Documents & Forms</h1>
        <ObjectUploader
          maxNumberOfFiles={1}
          maxFileSize={104857600}
          onGetUploadParameters={handleGetUploadParameters}
          onComplete={handleUploadComplete}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </ObjectUploader>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2" data-testid="tabs-documents">
          <TabsTrigger value="my-documents" data-testid="tab-my-documents">My Documents</TabsTrigger>
          <TabsTrigger value="court-forms" data-testid="tab-court-forms">Hawaii Court Forms</TabsTrigger>
        </TabsList>

        {/* My Documents Tab */}
        <TabsContent value="my-documents" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
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

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document: Document) => (
              <Card key={document.id} className="hover-elevate" data-testid={`card-document-${document.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
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
                      Uploaded: {document.createdAt ? format(new Date(document.createdAt), "MMM d, yyyy") : "Unknown"}
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownload(document)}
                      data-testid={`button-view-${document.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownload(document)}
                      data-testid={`button-download-${document.id}`}
                    >
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
        </TabsContent>

        {/* Hawaii Court Forms Tab */}
        <TabsContent value="court-forms" className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Hawaii court forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-court-forms"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Hawaii State Court Forms
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Official forms from Hawaii state courts. Click any form to open it in a new tab.
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {FORM_CATEGORIES.map((category) => {
                  const categoryForms = searchTerm
                    ? filteredForms.filter(f => f.category === category)
                    : getFormsByCategory(category);

                  if (categoryForms.length === 0) return null;

                  return (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="hover-elevate px-3 rounded-md" data-testid={`accordion-${category}`}>
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{category}</span>
                          <Badge variant="secondary">{categoryForms.length} forms</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 px-3 pt-2">
                        {categoryForms.map((form) => (
                          <div
                            key={form.id}
                            className="flex items-start justify-between gap-4 p-3 rounded-md hover-elevate border"
                            data-testid={`form-${form.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{form.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{form.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {form.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(form.url, "_blank")}
                              data-testid={`button-open-form-${form.id}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
